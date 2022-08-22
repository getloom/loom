import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {ServiceByName} from '$lib/app/eventTypes';
import {
	CreateCommunity,
	ReadCommunities,
	ReadCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
} from '$lib/vocab/community/communityEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {createDefaultAdminSpaces, createDefaultSpaces} from '$lib/vocab/space/spaceServices';
import type {ServiceRequest} from '$lib/server/service';
import {ADMIN_COMMUNITY_ID, ADMIN_COMMUNITY_NAME} from '$lib/app/admin';
import {OK, type Result} from '@feltcoop/felt';
import type {Community} from '$lib/vocab/community/community';
import type {CommunityPersona} from '$lib/vocab/persona/persona';
import type {Space} from '$lib/vocab/space/space';

const log = new Logger(gray('[') + blue('communityServices') + gray(']'));

const BLOCKLIST = new Set(['docs', 'schemas', 'about']);

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

//Returns a single community object
export const ReadCommunityService: ServiceByName['ReadCommunity'] = {
	event: ReadCommunity,
	perform: async ({repos, params, account_id}) => {
		log.trace('[ReadCommunity] account', account_id); // TODO logging
		log.trace('[ReadCommunity] community', params.community_id);

		const findCommunityResult = await repos.community.findById(params.community_id);
		if (!findCommunityResult.ok) {
			return {
				ok: false,
				status: 404,
				message: 'no community found',
			};
		}
		return {
			ok: true,
			status: 200,
			value: {community: findCommunityResult.value},
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

			// Create the community
			const createCommunityResult = await repos.community.create(
				'standard',
				name,
				params.settings || toDefaultCommunitySettings(name),
			);
			log.trace('createCommunityResult', createCommunityResult);

			if (!createCommunityResult.ok) {
				log.trace('[CreateCommunity] error creating community');
				return {
					ok: false,
					status: 500,
					message: 'error creating community',
				};
			}
			const community = createCommunityResult.value;

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
				params.persona_id,
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
				params.persona_id,
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
			const spaces = createDefaultSpaceResult.value;

			return {
				ok: true,
				status: 200,
				value: {
					community,
					spaces,
					communityPersona,
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

//TODO don't let users delete their home community
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
	serviceRequest: ServiceRequest<any, any>,
): Promise<
	Result<{value?: {community: Community; persona: CommunityPersona; spaces: Space[]}}>
> => {
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
	const community = createCommunityResult.value;

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

	// Create the community's default spaces.
	const createSpacesResult = await createDefaultAdminSpaces(
		serviceRequest,
		persona.persona_id,
		community,
	);
	if (!createSpacesResult.ok) return createSpacesResult;

	return {ok: true, value: {community, persona, spaces: createSpacesResult.value}};
};
