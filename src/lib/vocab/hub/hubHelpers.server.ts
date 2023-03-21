import {unwrap} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {ADMIN_HUB_ID, ADMIN_HUB_NAME} from '$lib/app/constants';
import type {Hub, HubSettings} from '$lib/vocab/hub/hub';
import type {ActorPersona, PublicPersona} from '$lib/vocab/actor/persona';
import type {Repos} from '$lib/db/Repos';
import type {Role} from '$lib/vocab/role/role';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {defaultAdminHubRoles, type RoleTemplate} from '$lib/app/templates';
import type {Policy} from '$lib/vocab/policy/policy';
import {ApiError} from '$lib/server/api';
import {randomHue} from '$lib/ui/color';

const log = new Logger(gray('[') + blue('hubHelpers.server') + gray(']'));

export const cleanOrphanHubs = async (hubIds: number[], repos: Repos): Promise<void> => {
	for (const hub_id of hubIds) {
		const accountPersonaAssignmentsCount = unwrap(
			await repos.assignment.countAccountPersonaAssignmentsByHubId(hub_id), // eslint-disable-line no-await-in-loop
		);
		if (accountPersonaAssignmentsCount === 0) {
			log.trace('no assignments found for hub, cleaning up', hub_id);
			unwrap(await repos.hub.deleteById(hub_id)); // eslint-disable-line no-await-in-loop
		}
	}
};

export const initAdminHub = async (
	repos: Repos,
): Promise<
	| undefined
	| {
			hub: Hub;
			persona: PublicPersona;
			ghost: PublicPersona;
			roles: Role[];
			policies: Policy[];
			assignments: Assignment[];
	  }
> => {
	if (await repos.hub.hasAdminHub()) return;

	// The admin hub doesn't exist, so this is a freshly installed instance!
	// We need to set up the admin hub and its persona.
	// For more see /src/docs/admin.md

	// Create the hub.
	const hub = unwrap(
		await repos.hub.create('community', ADMIN_HUB_NAME, toDefaultHubSettings(ADMIN_HUB_NAME)),
	);

	// Create the hub persona.
	const persona = unwrap(await repos.persona.createCommunityPersona(hub.name, hub.hub_id));

	// Init
	const {roles, policies, assignments} = await initTemplateGovernanceForHub(
		repos,
		defaultAdminHubRoles,
		hub,
		persona.persona_id,
	);

	// Create the ghost persona.
	const ghost = unwrap(await repos.persona.createGhostPersona());

	return {hub, persona, ghost, roles, policies, assignments};
};

/**
 * Initializes hub governance from templates,
 * creating the initial roles and policies, and the assignment for the creator persona.
 * @param repos - the db repo
 * @param roleTemplates - the array of role templates
 * @param hub  - the hub which the templates are being initialized
 * @param actor - the creator persona
 * @returns
 */
export const initTemplateGovernanceForHub = async (
	repos: Repos,
	roleTemplates: RoleTemplate[],
	hub: Hub,
	actor: number,
): Promise<{roles: Role[]; policies: Policy[]; assignments: Assignment[]}> => {
	if (!roleTemplates.length) throw Error('Expected at least one role template');

	const roles: Role[] = [];
	const policies: Policy[] = [];
	let creatorRoleId: number | undefined;
	let defaultRoleId: number | undefined;

	// TODO can this be safely batched?
	for (const roleTemplate of roleTemplates) {
		log.trace('creating role from template', roleTemplate);
		const role = await repos.role.create(hub.hub_id, roleTemplate.name); // eslint-disable-line no-await-in-loop
		roles.push(role);

		if (roleTemplate.default) {
			defaultRoleId = role.role_id;
			hub.settings.defaultRoleId = defaultRoleId;
			unwrap(await repos.hub.updateSettings(hub.hub_id, hub.settings)); // eslint-disable-line no-await-in-loop
		}
		if (roleTemplate.creator) {
			creatorRoleId = role.role_id;
		}

		if (roleTemplate.policies) {
			// TODO batch with a repo method
			for (const policyTemplate of roleTemplate.policies) {
				policies.push(await repos.policy.create(role.role_id, policyTemplate.permission)); // eslint-disable-line no-await-in-loop
			}
		}
	}

	// TODO in some cases we probably want to add both the `creatorRoleId` and `defaultRoleId` assignment, how to express that in the template data?
	const creatorAssignmentRoleId = creatorRoleId || defaultRoleId || roles[0].role_id;
	const creatorAssignment = unwrap(
		await repos.assignment.create(actor, hub.hub_id, creatorAssignmentRoleId),
	);

	return {roles, policies, assignments: [creatorAssignment]};
};

export const checkRemovePersona = async (
	persona_id: number,
	hub_id: number,
	repos: Repos,
): Promise<void> => {
	if (!unwrap(await repos.assignment.isPersonaInHub(persona_id, hub_id))) {
		throw new ApiError(400, 'persona is not in the hub');
	}
	const persona = unwrap(
		await repos.persona.findById<Pick<ActorPersona, 'type' | 'hub_id'>>(persona_id, [
			'type',
			'hub_id',
		]),
	);
	if (!persona) {
		throw new ApiError(404, 'no persona found');
	}
	const hub = unwrap(await repos.hub.findById(hub_id));
	if (!hub) {
		throw new ApiError(404, 'no hub found');
	}
	if (hub.type === 'personal') {
		throw new ApiError(405, 'cannot leave a personal hub');
	}
	if (hub_id === ADMIN_HUB_ID) {
		const adminAssignmentsCount = unwrap(
			await repos.assignment.countAccountPersonaAssignmentsByHubId(hub_id),
		);
		// TODO this fails if the persona has multiple roles
		if (adminAssignmentsCount === 1) {
			throw new ApiError(405, 'cannot orphan the admin hub');
		}
	}
	if (persona.type === 'community' && persona.hub_id === hub_id) {
		throw new ApiError(405, 'community persona cannot leave its hub');
	}
};

export const toDefaultHubSettings = (name: string): HubSettings => ({
	hue: randomHue(name),
	//this is a hack to allow for creation of the hub before it's default role is created
	defaultRoleId: -1,
});
