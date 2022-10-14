import {Logger} from '@feltcoop/felt/util/log.js';

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
import {OK, type Result} from '@feltcoop/felt';
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
		const findCommunitiesResult = await repos.community.filterByAccount(account_id);
		if (!findCommunitiesResult.ok) {
			log.trace('[ReadCommunities] error searching for communities');
			return {
				ok: false,
				status: 500,
				message: 'error searching for communities',
			};
		}
		return {
			ok: true,
			status: 200,
			value: {communities: findCommunitiesResult.value},
		};
	},
};

//Returns a single community with its related data.
export const ReadCommunityService: ServiceByName['ReadCommunity'] = {
	event: ReadCommunity,
	perform: async ({repos, params, account_id}) => {
		const {community_id} = params;

		log.trace('[ReadCommunity] account', account_id); // TODO logging
		log.trace('[ReadCommunity] community', community_id);

		const findCommunityResult = await repos.community.findById(community_id);
		if (!findCommunityResult.ok) {
			return {ok: false, status: 404, message: 'no community found'};
		}

		const [spacesResult, membershipsResult] = await Promise.all([
			repos.space.filterByCommunity(community_id),
			repos.membership.filterByCommunityId(community_id),
		]);
		if (!spacesResult.ok) {
			return {ok: false, status: 500, message: 'failed to filter spaces'};
		}
		if (!membershipsResult.ok) {
			return {ok: false, status: 500, message: 'failed to filter memberships'};
		}
		const spaces = spacesResult.value;

		// TODO is this more efficient than parallelizing `persona.filterByCommunity`?
		const personaIds = membershipsResult.value.map((m) => m.persona_id);
		const [personasResult, directoriesResult] = await Promise.all([
			repos.persona.filterByIds(personaIds),
			repos.entity.filterByIds(spaces.map((s) => s.directory_id)),
		]);
		if (!personasResult.ok) {
			return {ok: false, status: 500, message: 'failed to filter personas'};
		}
		if (!directoriesResult.ok) {
			return {ok: false, status: 500, message: 'failed to filter directories'};
		}

		return {
			ok: true,
			status: 200,
			value: {
				community: findCommunityResult.value,
				spaces,
				directories: directoriesResult.value as Array<Entity & {data: DirectoryEntityData}>,
				memberships: membershipsResult.value,
				personas: personasResult.value,
			},
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
			const findCommunityResult = await repos.community.findByName(name);
			if (!findCommunityResult.ok) {
				return {ok: false, status: 500, message: 'failed to lookup existing community by name'};
			}
			if (findCommunityResult.value) {
				return {ok: false, status: 409, message: 'a community with that name already exists'};
			}

			let settings = toDefaultCommunitySettings(name);
			if (params.settings) {
				settings = {...settings, ...params.settings};
			}

			// Create the community
			const createCommunityResult = await repos.community.create('standard', name, settings);
			log.trace('createCommunityResult', createCommunityResult);

			if (!createCommunityResult.ok) {
				log.trace('[CreateCommunity] error creating community');
				return {
					ok: false,
					status: 500,
					message: 'error creating community',
				};
			}
			let community = createCommunityResult.value;

			// Create the default role and assign it
			const initDefaultRoleResult = await initDefaultRoleForCommunity(repos, community);
			if (!initDefaultRoleResult.ok) {
				return {
					ok: false,
					status: 500,
					message: 'error initializing default role',
				};
			}

			community = initDefaultRoleResult.value.community;
			const role = initDefaultRoleResult.value.defaultRole;

			// Create the community persona and its membership
			const communityPersonaResult = await repos.persona.createCommunityPersona(
				community.name,
				community.community_id,
			);
			if (!communityPersonaResult.ok) {
				log.trace('[CreateCommunity] error creating community persona');
				return {
					ok: false,
					status: 500,
					message: 'error creating community persona',
				};
			}
			const communityPersona = communityPersonaResult.value;
			const communityPersonaMembershipResult = await repos.membership.create(
				communityPersona.persona_id,
				community.community_id,
			);
			if (!communityPersonaMembershipResult.ok) {
				log.trace('[CreateCommunity] error creating community persona membership');
				return {
					ok: false,
					status: 500,
					message: 'error creating community persona membership',
				};
			}

			// Create the membership for the persona that's creating the community.
			const creatorMembershipResult = await repos.membership.create(
				params.actor,
				community.community_id,
			);
			if (!creatorMembershipResult.ok) {
				log.trace('[CreateCommunity] error making creator membership');
				return {
					ok: false,
					status: 500,
					message: 'error making creator membership',
				};
			}

			// Create default spaces.
			const createDefaultSpaceResult = await createDefaultSpaces(
				serviceRequest,
				params.actor,
				community,
			);
			if (!createDefaultSpaceResult.ok) {
				log.trace('[CreateCommunity] error creating community default spaces');
				return {
					ok: false,
					status: 500,
					message: 'error creating community default spaces',
				};
			}
			const {spaces, directories} = createDefaultSpaceResult.value;

			return {
				ok: true,
				status: 200,
				value: {
					community,
					role,
					spaces,
					directories,
					personas: [communityPersona], // TODO add the requesting persona just for completion, after we add `actor` to all events
					memberships: [communityPersonaMembershipResult.value, creatorMembershipResult.value],
				},
			};
		}),
};

export const UpdateCommunitySettingsService: ServiceByName['UpdateCommunitySettings'] = {
	event: UpdateCommunitySettings,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const result = await repos.community.updateSettings(params.community_id, params.settings);
			if (!result.ok) {
				return {ok: false, status: 500, message: 'failed to update community settings'};
			}
			return {ok: true, status: 200, value: null};
		}),
};

export const DeleteCommunityService: ServiceByName['DeleteCommunity'] = {
	event: DeleteCommunity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const communityResult = await repos.community.findById(params.community_id);
			if (!communityResult.ok) {
				return {
					ok: false,
					status: 404,
					message: 'no community found',
				};
			}
			const community = communityResult.value;
			if (community.type === 'personal') {
				return {ok: false, status: 405, message: 'cannot delete personal community'};
			}
			if (community.community_id === ADMIN_COMMUNITY_ID) {
				return {ok: false, status: 405, message: 'cannot delete admin community'};
			}
			const deleteResult = await repos.community.deleteById(params.community_id);
			if (!deleteResult.ok) {
				return {ok: false, status: 500, message: 'failed to delete community'};
			}
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
	const createCommunityResult = await repos.community.create(
		'standard',
		ADMIN_COMMUNITY_NAME,
		toDefaultCommunitySettings(ADMIN_COMMUNITY_NAME),
	);
	if (!createCommunityResult.ok) return createCommunityResult;
	let community = createCommunityResult.value;

	// Create the default role and assign it
	const initDefaultRoleResult = await initDefaultRoleForCommunity(repos, community);
	if (!initDefaultRoleResult.ok) {
		return initDefaultRoleResult;
	}

	const role = initDefaultRoleResult.value.defaultRole;
	community = initDefaultRoleResult.value.community;

	// Create the community persona.
	const createCommunityPersonaResult = await repos.persona.createCommunityPersona(
		community.name,
		community.community_id,
	);
	if (!createCommunityPersonaResult.ok) return createCommunityPersonaResult;
	const persona = createCommunityPersonaResult.value;

	// Create the community persona's membership.
	const createMembershipResult = await repos.membership.create(
		persona.persona_id,
		community.community_id,
	);
	if (!createMembershipResult.ok) return createMembershipResult;

	return {ok: true, value: {community, persona, role}};
};

export const initDefaultRoleForCommunity = async (
	repos: Repos,
	community: Community,
): Promise<Result<{value: {community: Community; defaultRole: Role}}>> => {
	const createDefaultRoleResult = await repos.role.createRole(community.community_id, DEFAULT_ROLE);
	log.trace('createDefaultRoleResult', createDefaultRoleResult);

	if (!createDefaultRoleResult.ok) {
		log.trace('[CreateCommunity] error creating default role for community');
		return createDefaultRoleResult;
	}
	const defaultRole = createDefaultRoleResult.value;

	const settings = {
		...community.settings,
		defaultRoleId: defaultRole.role_id,
	};

	const updateSettingsResult = await repos.community.updateSettings(
		community.community_id,
		settings,
	);
	log.trace('updateSettingsResult', updateSettingsResult);

	if (!updateSettingsResult.ok) {
		log.trace('[CreateCommunity] error setting default role_id');
		return updateSettingsResult;
	}

	community.settings = settings;

	return {ok: true, value: {community, defaultRole}};
};
