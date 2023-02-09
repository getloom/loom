import {OK, unwrap, type Result} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {ADMIN_COMMUNITY_ID, ADMIN_COMMUNITY_NAME} from '$lib/app/constants';
import type {Community} from '$lib/vocab/community/community';
import type {ActorPersona, PublicPersona} from '$lib/vocab/persona/persona';
import type {Repos} from '$lib/db/Repos';
import type {Role} from '$lib/vocab/role/role';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {defaultAdminCommunityRoles, type RoleTemplate} from '$lib/app/templates';
import type {Policy} from '$lib/vocab/policy/policy';
import type {ApiResult} from '$lib/server/api';

const log = new Logger(gray('[') + blue('communityHelpers.server') + gray(']'));

export const cleanOrphanCommunities = async (
	communityIds: number[],
	repos: Repos,
): Promise<Result> => {
	for (const community_id of communityIds) {
		const accountPersonaAssignmentsCount = unwrap(
			await repos.assignment.countAccountPersonaAssignmentsByCommunityId(community_id), // eslint-disable-line no-await-in-loop
		);
		if (accountPersonaAssignmentsCount === 0) {
			log.trace('no assignments found for community, cleaning up', community_id);
			unwrap(await repos.community.deleteById(community_id)); // eslint-disable-line no-await-in-loop
		}
	}
	return OK;
};

export const initAdminCommunity = async (
	repos: Repos,
): Promise<
	Result<{
		value?: {
			community: Community;
			persona: PublicPersona;
			ghost: PublicPersona;
			roles: Role[];
			policies: Policy[];
			assignments: Assignment[];
		};
	}>
> => {
	if (await repos.community.hasAdminCommunity()) return OK;

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
	const {roles, policies, assignments} = unwrap(
		await initTemplateGovernanceForCommunity(
			repos,
			defaultAdminCommunityRoles,
			community,
			persona.persona_id,
		),
	);

	// Create the ghost persona.
	const ghost = unwrap(await repos.persona.createGhostPersona());

	return {ok: true, value: {community, persona, ghost, roles, policies, assignments}};
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
): Promise<Result<{value: {roles: Role[]; policies: Policy[]; assignments: Assignment[]}}>> => {
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

	return {ok: true, value: {roles, policies, assignments: [creatorAssignment]}};
};

export const checkRemovePersona = async (
	persona_id: number,
	community_id: number,
	repos: Repos,
): Promise<ApiResult<undefined>> => {
	// TODO why can't this be parallelized? bug in our code? or the driver? failed to reproduce in the driver.
	// const [personaResult, communityResult] = await Promise.all([
	// 	repos.persona.findById(persona_id),
	// 	repos.community.findById(community_id),
	// ]);
	const persona = unwrap(
		await repos.persona.findById<Pick<ActorPersona, 'type' | 'community_id'>>(persona_id, [
			'type',
			'community_id',
		]),
	);
	const community = unwrap(await repos.community.findById(community_id));
	if (!persona) {
		return {ok: false, status: 404, message: 'no persona found'};
	}
	if (!community) {
		return {ok: false, status: 404, message: 'no community found'};
	}
	if (community.type === 'personal') {
		return {ok: false, status: 405, message: 'cannot leave a personal community'};
	}
	if (community_id === ADMIN_COMMUNITY_ID) {
		const adminAssignmentsCount = unwrap(
			await repos.assignment.countAccountPersonaAssignmentsByCommunityId(community_id),
		);
		if (adminAssignmentsCount === 1) {
			return {ok: false, status: 405, message: 'cannot orphan the admin community'};
		}
	}
	if (persona.type === 'community' && persona.community_id === community_id) {
		return {ok: false, status: 405, message: 'community persona cannot leave its community'};
	}
	return {ok: true, status: 200, value: undefined};
};
