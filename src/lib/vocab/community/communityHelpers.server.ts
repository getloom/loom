import {unwrap} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {ADMIN_COMMUNITY_ID, ADMIN_COMMUNITY_NAME} from '$lib/app/constants';
import type {Community, CommunitySettings} from '$lib/vocab/community/community';
import type {ActorPersona, PublicPersona} from '$lib/vocab/persona/persona';
import type {Repos} from '$lib/db/Repos';
import type {Role} from '$lib/vocab/role/role';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {defaultAdminCommunityRoles, type RoleTemplate} from '$lib/app/templates';
import type {Policy} from '$lib/vocab/policy/policy';
import {ApiError} from '$lib/server/api';
import {randomHue} from '$lib/ui/color';

const log = new Logger(gray('[') + blue('communityHelpers.server') + gray(']'));

export const cleanOrphanCommunities = async (
	communityIds: number[],
	repos: Repos,
): Promise<void> => {
	for (const community_id of communityIds) {
		const accountPersonaAssignmentsCount = unwrap(
			await repos.assignment.countAccountPersonaAssignmentsByCommunityId(community_id), // eslint-disable-line no-await-in-loop
		);
		if (accountPersonaAssignmentsCount === 0) {
			log.trace('no assignments found for community, cleaning up', community_id);
			unwrap(await repos.community.deleteById(community_id)); // eslint-disable-line no-await-in-loop
		}
	}
};

export const initAdminCommunity = async (
	repos: Repos,
): Promise<
	| undefined
	| {
			community: Community;
			persona: PublicPersona;
			ghost: PublicPersona;
			roles: Role[];
			policies: Policy[];
			assignments: Assignment[];
	  }
> => {
	if (await repos.community.hasAdminCommunity()) return;

	// The admin community doesn't exist, so this is a freshly installed instance!
	// We need to set up the admin community and its persona.
	// For more see /src/docs/admin.md

	// Create the community.
	const community = unwrap(
		await repos.community.create(
			'standard',
			ADMIN_COMMUNITY_NAME,
			toDefaultCommunitySettings(ADMIN_COMMUNITY_NAME),
		),
	);

	// Create the community persona.
	const persona = unwrap(
		await repos.persona.createCommunityPersona(community.name, community.community_id),
	);

	// Init
	const {roles, policies, assignments} = await initTemplateGovernanceForCommunity(
		repos,
		defaultAdminCommunityRoles,
		community,
		persona.persona_id,
	);

	// Create the ghost persona.
	const ghost = unwrap(await repos.persona.createGhostPersona());

	return {community, persona, ghost, roles, policies, assignments};
};

/**
 * Initializes community governance from templates,
 * creating the initial roles and policies, and the assignment for the creator persona.
 * @param repos - the db repo
 * @param roleTemplates - the array of role templates
 * @param community  - the community which the templates are being initialized
 * @param actor - the creator persona
 * @returns
 */
export const initTemplateGovernanceForCommunity = async (
	repos: Repos,
	roleTemplates: RoleTemplate[],
	community: Community,
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
		const role = unwrap(
			await repos.role.create(community.community_id, roleTemplate.name), // eslint-disable-line no-await-in-loop
		);
		roles.push(role);

		if (roleTemplate.default) {
			defaultRoleId = role.role_id;
			community.settings.defaultRoleId = defaultRoleId;
			unwrap(await repos.community.updateSettings(community.community_id, community.settings)); // eslint-disable-line no-await-in-loop
		}
		if (roleTemplate.creator) {
			creatorRoleId = role.role_id;
		}

		if (roleTemplate.policies) {
			// TODO batch with a repo method
			for (const policyTemplate of roleTemplate.policies) {
				policies.push(unwrap(await repos.policy.create(role.role_id, policyTemplate.permission))); // eslint-disable-line no-await-in-loop
			}
		}
	}

	// TODO in some cases we probably want to add both the `creatorRoleId` and `defaultRoleId` assignment, how to express that in the template data?
	const creatorAssignmentRoleId = creatorRoleId || defaultRoleId || roles[0].role_id;
	const creatorAssignment = unwrap(
		await repos.assignment.create(actor, community.community_id, creatorAssignmentRoleId),
	);

	return {roles, policies, assignments: [creatorAssignment]};
};

export const checkRemovePersona = async (
	persona_id: number,
	community_id: number,
	repos: Repos,
): Promise<void> => {
	if (!unwrap(await repos.assignment.isPersonaInCommunity(persona_id, community_id))) {
		throw new ApiError(400, 'persona is not in the community');
	}
	const persona = unwrap(
		await repos.persona.findById<Pick<ActorPersona, 'type' | 'community_id'>>(persona_id, [
			'type',
			'community_id',
		]),
	);
	if (!persona) {
		throw new ApiError(404, 'no persona found');
	}
	const community = unwrap(await repos.community.findById(community_id));
	if (!community) {
		throw new ApiError(404, 'no community found');
	}
	if (community.type === 'personal') {
		throw new ApiError(405, 'cannot leave a personal community');
	}
	if (community_id === ADMIN_COMMUNITY_ID) {
		const adminAssignmentsCount = unwrap(
			await repos.assignment.countAccountPersonaAssignmentsByCommunityId(community_id),
		);
		// TODO this fails if the persona has multiple roles
		if (adminAssignmentsCount === 1) {
			throw new ApiError(405, 'cannot orphan the admin community');
		}
	}
	if (persona.type === 'community' && persona.community_id === community_id) {
		throw new ApiError(405, 'community persona cannot leave its community');
	}
};

export const toDefaultCommunitySettings = (name: string): CommunitySettings => ({
	hue: randomHue(name),
	//this is a hack to allow for creation of the community before it's default role is created
	defaultRoleId: -1,
});
