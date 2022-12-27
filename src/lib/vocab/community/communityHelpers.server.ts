import {OK, unwrap, type Result} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {NonAuthorizedServiceRequest} from '$lib/server/service';
import {ADMIN_COMMUNITY_NAME, ADMIN_DEFAULT_ROLE, DEFAULT_ROLE} from '$lib/app/constants';
import type {Community} from '$lib/vocab/community/community';
import type {PublicPersona} from '$lib/vocab/persona/persona';
import type {Repos} from '$lib/db/Repos';
import type {Role} from '$lib/vocab/role/role';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import type {RoleTemplate} from '$lib/app/templates';
import type {Policy} from '$lib/vocab/policy/policy';
import {permissionNames} from '$lib/vocab/policy/permissions';

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
	serviceRequest: NonAuthorizedServiceRequest,
): Promise<
	Result<{
		value?: {
			community: Community;
			persona: PublicPersona;
			ghost: PublicPersona;
			role: Role;
			policies: Policy[];
			assignment: Assignment;
		};
	}>
> => {
	const {repos} = serviceRequest;

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

	// Create the default role with all permissions and assign it
	const role = unwrap(await initDefaultRoleForCommunity(repos, community, ADMIN_DEFAULT_ROLE));
	const policies: Policy[] = [];
	for (const permission of permissionNames) {
		// eslint-disable-next-line no-await-in-loop
		const policy = unwrap(await repos.policy.create(role.role_id, permission));
		policies.push(policy);
	}

	// Create the community persona.
	const persona = unwrap(
		await repos.persona.createCommunityPersona(community.name, community.community_id),
	);

	// Create the community persona's assignment.
	const assignment = unwrap(
		await repos.assignment.create(
			persona.persona_id,
			community.community_id,
			community.settings.defaultRoleId,
		),
	);

	// Create the ghost persona.
	const ghost = unwrap(await repos.persona.createGhostPersona());

	return {ok: true, value: {community, persona, ghost, role, policies, assignment}};
};

/**
 * Creates the default role for a community,
 * mutating the `community` instance with the changed settings.
 */
export const initDefaultRoleForCommunity = async (
	repos: Repos,
	community: Community,
	roleName: string = DEFAULT_ROLE,
): Promise<Result<{value: Role}>> => {
	const defaultRole = unwrap(await repos.role.create(community.community_id, roleName));

	const settings = {...community.settings, defaultRoleId: defaultRole.role_id};

	unwrap(await repos.community.updateSettings(community.community_id, settings));
	community.settings = settings;

	return {ok: true, value: defaultRole};
};

/**
 * This function takes in a RoleTemplate array & generates the provided Roles & Policies from it inside the community provided.
 * Lastly, it  creates the assignment to a role for the invoking actor.
 * @param repos - the db repo
 * @param roleTemplates - the array of role templates
 * @param community  - the community which the templates are being initialized
 * @param actor - the invoking persona
 * @returns
 */
export const initTemplateGovernanceForCommunity = async (
	repos: Repos,
	roleTemplates: RoleTemplate[],
	community: Community,
	actor: number,
): Promise<Result<{value: {roles: Role[]; policies: Policy[]; creatorAssignment: Assignment}}>> => {
	const roles: Role[] = [];
	const policies: Policy[] = [];
	let creatorRoleId: number | undefined;
	let defaultRoleId: number | undefined;
	for (const roleTemplate of roleTemplates) {
		log.trace('generating role', roleTemplate);
		let role: Role;

		if (roleTemplate.default) {
			// Create the default role and assign it
			role = unwrap(
				// eslint-disable-next-line no-await-in-loop
				await initDefaultRoleForCommunity(repos, community, roleTemplate.name),
			);
			defaultRoleId = role.role_id;
		} else {
			role = unwrap(
				// eslint-disable-next-line no-await-in-loop
				await repos.role.create(community.community_id, roleTemplate.name),
			);
			if (roleTemplate.creator) {
				creatorRoleId = role.role_id;
			}
		}
		roles.push(role);

		if (roleTemplate.policies) {
			for (const policyTemplate of roleTemplate.policies) {
				const policy = unwrap(
					// eslint-disable-next-line no-await-in-loop
					await repos.policy.create(role.role_id, policyTemplate.permission),
				);
				policies.push(policy);
			}
		}
	}
	let creatorAssignment: Assignment;
	if (creatorRoleId) {
		creatorAssignment = unwrap(
			await repos.assignment.create(actor, community.community_id, creatorRoleId),
		);
	} else if (defaultRoleId) {
		creatorAssignment = unwrap(
			await repos.assignment.create(actor, community.community_id, defaultRoleId),
		);
	} else {
		creatorAssignment = unwrap(
			await repos.assignment.create(actor, community.community_id, roles[0].role_id),
		);
	}
	return {ok: true, value: {roles, creatorAssignment, policies}};
};
