import {Logger} from '@feltcoop/felt/util/log.js';
import {OK, unwrap, type Result} from '@feltcoop/felt';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {
	CreateCommunity,
	ReadCommunities,
	ReadCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
} from '$lib/vocab/community/communityEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {createDefaultSpaces} from '$lib/vocab/space/spaceServices';
import type {NonAuthorizedServiceRequest} from '$lib/server/service';
import {ADMIN_COMMUNITY_ID, ADMIN_COMMUNITY_NAME} from '$lib/app/admin';
import type {Community} from '$lib/vocab/community/community';
import type {CommunityPersona} from '$lib/vocab/persona/persona';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {Repos} from '$lib/db/Repos';
import type {Role} from '$lib/vocab/role/role';

const log = new Logger(gray('[') + blue('communityServices') + gray(']'));

const BLOCKLIST = new Set(['docs', 'schemas', 'about']);

//TODO allow for more robust defaults at Community init
const DEFAULT_ROLE = 'member';

// Returns a list of community objects
export const ReadCommunitiesService: ServiceByName['ReadCommunities'] = {
	event: ReadCommunities,
	perform: async ({repos, account_id}) => {
		const communities = unwrap(await repos.community.filterByAccount(account_id));
		return {ok: true, status: 200, value: {communities}};
	},
};

//Returns a single community with its related data.
export const ReadCommunityService: ServiceByName['ReadCommunity'] = {
	event: ReadCommunity,
	perform: async ({repos, params, account_id}) => {
		const {community_id} = params;

		log.trace('[ReadCommunity] account', account_id); // TODO logging
		log.trace('[ReadCommunity] community', community_id);

		const community = unwrap(await repos.community.findById(community_id));
		if (!community) {
			return {ok: false, status: 404, message: 'no community found'};
		}

		const [spacesResult, rolesResult, membershipsResult] = await Promise.all([
			repos.space.filterByCommunity(community_id),
			repos.role.filterByCommunityId(community_id),
			repos.membership.filterByCommunityId(community_id),
		]);
		const spaces = unwrap(spacesResult);
		const roles = unwrap(rolesResult);
		const memberships = unwrap(membershipsResult);

		// TODO is this more efficient than parallelizing `persona.filterByCommunity`?
		const personaIds = memberships.map((m) => m.persona_id);
		const [personasResult, directoriesResult] = await Promise.all([
			repos.persona.filterByIds(personaIds),
			repos.entity.filterByIds(spaces.map((s) => s.directory_id)),
		]);
		const {personas} = unwrap(personasResult);
		const {entities: directories} = unwrap(directoriesResult) as {
			entities: Array<Entity & {data: DirectoryEntityData}>;
		};

		return {
			ok: true,
			status: 200,
			value: {community, spaces, directories, roles, memberships, personas},
		};
	},
};

//Creates a new community for an instance
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const CreateCommunityService: ServiceByName['CreateCommunity'] = {
	event: CreateCommunity,
	perform: (serviceRequest) =>
		serviceRequest.transact(async (repos) => {
			const {params, account_id} = serviceRequest;
			log.trace('creating community account_id', account_id);
			const name = params.name.trim();

			// run name through block list
			if (BLOCKLIST.has(name.toLowerCase())) {
				return {ok: false, status: 409, message: 'a community with that name is not allowed'};
			}

			// Check for duplicate community names.
			const existingCommunity = unwrap(await repos.community.findByName(name), 'custom');
			if (existingCommunity) {
				return {ok: false, status: 409, message: 'a community with that name already exists'};
			}

			let settings = toDefaultCommunitySettings(name);
			if (params.settings) {
				settings = {...settings, ...params.settings};
			}

			// Create the community
			const community = unwrap(await repos.community.create('standard', name, settings));

			// Create the default role and assign it
			const role = unwrap(await initDefaultRoleForCommunity(repos, community));

			// Create the community persona and its membership
			const communityPersona = unwrap(
				await repos.persona.createCommunityPersona(community.name, community.community_id),
			);
			const communityPersonaMembership = unwrap(
				await repos.membership.create(communityPersona.persona_id, community.community_id),
			);

			// Create the membership for the persona that's creating the community.
			const creatorMembership = unwrap(
				await repos.membership.create(params.actor, community.community_id),
			);

			// Create default spaces.
			const {spaces, directories} = unwrap(
				await createDefaultSpaces(serviceRequest, params.actor, community),
			);

			return {
				ok: true,
				status: 200,
				value: {
					community,
					role,
					spaces,
					directories,
					personas: [communityPersona], // TODO add the requesting persona just for completion, after we add `actor` to all events
					memberships: [communityPersonaMembership, creatorMembership],
				},
			};
		}),
};

export const UpdateCommunitySettingsService: ServiceByName['UpdateCommunitySettings'] = {
	event: UpdateCommunitySettings,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			unwrap(await repos.community.updateSettings(params.community_id, params.settings));
			return {ok: true, status: 200, value: null};
		}),
};

export const DeleteCommunityService: ServiceByName['DeleteCommunity'] = {
	event: DeleteCommunity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const community = unwrap(await repos.community.findById(params.community_id));
			if (!community) {
				return {ok: false, status: 404, message: 'no community found'};
			}
			if (community.type === 'personal') {
				return {ok: false, status: 405, message: 'cannot delete personal community'};
			}
			if (community.community_id === ADMIN_COMMUNITY_ID) {
				return {ok: false, status: 405, message: 'cannot delete admin community'};
			}
			unwrap(await repos.community.deleteById(params.community_id));
			return {ok: true, status: 200, value: null};
		}),
};

export const initAdminCommunity = async (
	serviceRequest: NonAuthorizedServiceRequest,
): Promise<Result<{value?: {community: Community; persona: CommunityPersona; role: Role}}>> => {
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

	// Create the community persona's membership.
	unwrap(await repos.membership.create(persona.persona_id, community.community_id));

	return {ok: true, value: {community, persona, role}};
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
