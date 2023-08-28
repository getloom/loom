import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {ADMIN_HUB_ID, ADMIN_HUB_NAME} from '$lib/util/constants';
import type {Hub, HubId, HubSettings} from '$lib/vocab/hub/hub';
import type {ActorId, PublicActor} from '$lib/vocab/actor/actor';
import type {Repos} from '$lib/db/Repos';
import type {Role, RoleId} from '$lib/vocab/role/role';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {defaultAdminHubRoles, type RoleTemplate} from '$lib/ui/templates';
import type {Policy} from '$lib/vocab/policy/policy';
import {ApiError} from '$lib/server/api';
import {randomHue} from '$lib/util/color';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

const log = new Logger(gray('[') + blue('hubHelpers.server') + gray(']'));

export type HubColumn = keyof Hub;
export const HUB_COLUMNS = {
	all: ['hub_id', 'type', 'name', 'settings', 'created', 'updated'],
	hub_id: ['hub_id'],
	type: ['type'],
	settings: ['settings'],
	hub_id_type: ['hub_id', 'type'],
	hub_id_settings: ['hub_id', 'settings'],
	hub_id_type_settings: ['hub_id', 'type', 'settings'],
} satisfies Record<string, HubColumn[]>;

/**
 * Deletes hubs that have no remaining account actors.
 * Returns the deleted hub ids, if any.
 * @param hubIds
 * @param repos
 */
export const cleanOrphanHubs = async (repos: Repos, hubIds: HubId[]): Promise<null | HubId[]> => {
	let deleted: HubId[] | null = null;
	for (const hub_id of hubIds) {
		// eslint-disable-next-line no-await-in-loop
		const accountActorAssignmentsCount = await repos.assignment.countAccountActorAssignmentsByHub(
			hub_id,
		);
		if (accountActorAssignmentsCount === 0) {
			log.debug('no assignments found for hub, cleaning up', hub_id);
			await deleteHub(repos, hub_id); // eslint-disable-line no-await-in-loop
			(deleted || (deleted = [])).push(hub_id);
		}
	}
	return deleted;
};

export const deleteHub = async (repos: Repos, hubId: HubId): Promise<void> => {
	await repos.space.deleteByHub(hubId);
	await repos.hub.deleteById(hubId);
};

export const initAdminHub = async (
	repos: Repos,
): Promise<
	| undefined
	| {
			hub: Hub;
			actor: PublicActor;
			ghost: PublicActor;
			roles: Role[];
			policies: Policy[];
			assignments: Assignment[];
	  }
> => {
	if (await repos.hub.hasAdminHub()) return;

	// The admin hub doesn't exist, so this is a freshly installed instance!
	// We need to set up the admin hub and its actor.
	// For more see https://www.felt.dev/docs/guide/admin

	// Create the hub.
	const hub = await repos.hub.create(
		'community',
		ADMIN_HUB_NAME,
		toDefaultHubSettings(ADMIN_HUB_NAME),
	);

	// Create the hub actor.
	const actor = await repos.actor.createHubActor(hub.name, hub.hub_id);

	// Init
	const {roles, policies, assignments} = await initTemplateGovernanceForHub(
		repos,
		defaultAdminHubRoles,
		hub,
		actor.actor_id,
	);

	// Create the ghost actor.
	const ghost = await repos.actor.createGhostActor();

	return {hub, actor, ghost, roles, policies, assignments};
};

/**
 * Initializes hub governance from templates,
 * creating the initial roles and policies, and the assignment for the creator actor.
 * @param repos - the db repo
 * @param roleTemplates - the array of role templates
 * @param hub  - the hub which the templates are being initialized
 * @param actor - the creator actor
 * @returns
 */
export const initTemplateGovernanceForHub = async (
	repos: Repos,
	roleTemplates: RoleTemplate[],
	hub: Hub,
	actor: ActorId,
): Promise<{roles: Role[]; policies: Policy[]; assignments: Assignment[]}> => {
	if (!roleTemplates.length) throw Error('Expected at least one role template');

	const roles: Role[] = [];
	const policies: Policy[] = [];
	let creatorRoleId: RoleId | undefined;
	let defaultRoleId: RoleId | undefined;

	// TODO can this be safely batched?
	for (const roleTemplate of roleTemplates) {
		log.debug('creating role from template', roleTemplate);
		const role = await repos.role.create(hub.hub_id, roleTemplate.name); // eslint-disable-line no-await-in-loop
		roles.push(role);

		if (roleTemplate.default) {
			defaultRoleId = role.role_id;
			hub.settings.defaultRoleId = defaultRoleId;
			await repos.hub.updateSettings(hub.hub_id, hub.settings); // eslint-disable-line no-await-in-loop
		}
		if (roleTemplate.creator) {
			creatorRoleId = role.role_id;
		}

		if (roleTemplate.policies) {
			// TODO batch with a repo method
			for (const policyTemplate of roleTemplate.policies) {
				policies.push(await repos.policy.create(role.role_id, policyTemplate.name)); // eslint-disable-line no-await-in-loop
			}
		}
	}

	// TODO in some cases we probably want to add both the `creatorRoleId` and `defaultRoleId` assignment, how to express that in the template data?
	const creatorAssignmentRoleId = creatorRoleId || defaultRoleId || roles[0].role_id;
	const creatorAssignment = await repos.assignment.create(
		actor,
		hub.hub_id,
		creatorAssignmentRoleId,
	);

	return {roles, policies, assignments: [creatorAssignment]};
};

export const checkRemoveActor = async (
	repos: Repos,
	actor_id: ActorId,
	hub_id: HubId,
): Promise<void> => {
	if (!(await repos.assignment.isActorInHub(actor_id, hub_id))) {
		throw new ApiError(400, 'actor is not in the hub');
	}
	const actor = await repos.actor.findById(actor_id, ACTOR_COLUMNS.type_hub_id);
	if (!actor) {
		throw new ApiError(404, 'no actor found');
	}
	const hub = await repos.hub.findById(hub_id, HUB_COLUMNS.type);
	if (!hub) {
		throw new ApiError(404, 'no hub found');
	}
	if (hub.type === 'personal') {
		throw new ApiError(405, 'cannot leave a personal hub');
	}
	if (hub_id === ADMIN_HUB_ID) {
		const distinctAccountActorCount = await repos.assignment.countDistinctAccountActorsByHub(
			hub_id,
		);
		// TODO this fails if the actor has multiple roles
		if (distinctAccountActorCount === 1) {
			throw new ApiError(405, 'cannot orphan the admin hub');
		}
	}
	if (actor.type === 'community' && actor.hub_id === hub_id) {
		throw new ApiError(405, 'community actor cannot leave its hub');
	}
};

export const toDefaultHubSettings = (name: string): HubSettings => ({
	hue: randomHue(name),
	//this is a hack to allow for creation of the hub before it's default role is created
	defaultRoleId: -1,
});
