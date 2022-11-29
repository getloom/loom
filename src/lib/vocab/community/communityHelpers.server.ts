import {OK, unwrap, type Result} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {NonAuthorizedServiceRequest} from '$lib/server/service';
import {ADMIN_COMMUNITY_NAME} from '$lib/app/constants';
import type {Community} from '$lib/vocab/community/community';
import type {PublicPersona} from '$lib/vocab/persona/persona';
import type {Repos} from '$lib/db/Repos';
import type {Role} from '$lib/vocab/role/role';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';

const log = new Logger(gray('[') + blue('communityHelpers.server') + gray(']'));

//TODO allow for more robust defaults at Community init
const DEFAULT_ROLE = 'member';

export const cleanOrphanCommunities = async (
	community_id: number,
	repos: Repos,
): Promise<Result> => {
	log.trace('[assignmentServices] checking if community is orphaned', community_id);
	const accountPersonaAssignmentsCount = unwrap(
		await repos.assignment.countAccountPersonaAssignmentsByCommunityId(community_id),
	);
	if (accountPersonaAssignmentsCount === 0) {
		log.trace('[assignmentServices] no assignments found for community, cleaning up', community_id);
		unwrap(await repos.community.deleteById(community_id));
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

	// Create the default role and assign it
	const role = unwrap(await initDefaultRoleForCommunity(repos, community));

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

	return {ok: true, value: {community, persona, ghost, role, assignment}};
};

/**
 * Creates the default role for a community,
 * mutating the `community` instance with the changed settings.
 */
export const initDefaultRoleForCommunity = async (
	repos: Repos,
	community: Community,
): Promise<Result<{value: Role}>> => {
	const defaultRole = unwrap(await repos.role.createRole(community.community_id, DEFAULT_ROLE));

	const settings = {...community.settings, defaultRoleId: defaultRole.role_id};

	unwrap(await repos.community.updateSettings(community.community_id, settings));
	community.settings = settings;

	return {ok: true, value: defaultRole};
};
