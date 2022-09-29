import {Logger} from '@feltcoop/felt/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateAccountPersona, ReadPersona} from '$lib/vocab/persona/personaEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {createDefaultAdminSpaces, createDefaultSpaces} from '$lib/vocab/space/spaceServices';
import {initAdminCommunity} from '$lib/vocab/community/communityServices';

const log = new Logger(gray('[') + blue('personaServices') + gray(']'));

const BLOCKLIST = new Set(['admin']);

//Creates a new persona
export const CreateAccountPersonaService: ServiceByName['CreateAccountPersona'] = {
	event: CreateAccountPersona,
	// TODO verify the `account_id` has permission to modify this persona
	// TODO add `persona_id` and verify it's one of the `account_id`'s personas
	perform: (serviceRequest) =>
		serviceRequest.transact(async (repos) => {
			const {params, account_id} = serviceRequest;
			log.trace('[CreateAccountPersona] creating persona', params.name);
			const name = params.name.trim();

			if (BLOCKLIST.has(name.toLowerCase())) {
				return {ok: false, status: 409, message: 'a persona with that name is not allowed'};
			}

			log.trace('[CreateAccountPersona] validating persona uniqueness', name);
			const findByNameResult = await repos.persona.findByName(name);
			if (!findByNameResult.ok) {
				return {ok: false, status: 500, message: 'error validating unique name for new persona'};
			}
			if (findByNameResult.value) {
				return {ok: false, status: 409, message: 'a persona with that name already exists'};
			}

			// First create the admin community if it doesn't exist yet.
			const initAdminCommunityResult = await initAdminCommunity(serviceRequest);
			if (!initAdminCommunityResult.ok) {
				return {ok: false, status: 500, message: 'failed to init admin community'};
			}

			// Create the persona's personal community.
			const createCommunityResult = await repos.community.create(
				'personal',
				name,
				toDefaultCommunitySettings(name),
			);
			if (!createCommunityResult.ok) {
				return {ok: false, status: 500, message: 'failed to create initial persona community'};
			}
			const community = createCommunityResult.value;

			// Create the persona.
			log.trace('[CreateAccountPersona] creating persona', name);
			const createPersonaResult = await repos.persona.createAccountPersona(
				name,
				account_id,
				community.community_id,
			);
			if (!createPersonaResult.ok) {
				return {ok: false, status: 500, message: 'error searching for community personas'};
			}
			const persona = createPersonaResult.value;

			// Create the persona's membership to its personal community.
			const membershipResult = await repos.membership.create(
				persona.persona_id,
				community.community_id,
			);
			if (!membershipResult.ok) {
				return {ok: false, status: 500, message: 'error creating membership in personal community'};
			}
			const membership = membershipResult.value;

			// If the admin community was created, create the admin spaces and the persona's membership.
			// This is a separate step because we need to create the admin community before any others
			// and the dependencies flow like this:
			// `adminCommunity => personalCommunity => persona => adminCommunitySpaces + adminCommunityMembership`
			if (initAdminCommunityResult.value) {
				const adminCommunity = initAdminCommunityResult.value.community;
				// Create the admin community's default spaces.
				const createDefaultAdminSpacesResult = await createDefaultAdminSpaces(
					{...serviceRequest, actor: persona},
					persona.persona_id,
					adminCommunity,
				);
				if (!createDefaultAdminSpacesResult.ok) {
					return {ok: false, status: 500, message: createDefaultAdminSpacesResult.message};
				}

				// Create the persona's membership to the admin community.
				const adminMembershipResult = await repos.membership.create(
					persona.persona_id,
					adminCommunity.community_id,
				);
				if (!adminMembershipResult.ok) {
					return {ok: false, status: 500, message: 'failed to init admin community'};
				}
			}

			// Create the default spaces.
			const createDefaultSpacesResult = await createDefaultSpaces(
				{...serviceRequest, actor: persona},
				persona.persona_id,
				community,
			);
			if (!createDefaultSpacesResult.ok) {
				return {ok: false, status: 500, message: createDefaultSpacesResult.message};
			}
			const {spaces, directories} = createDefaultSpacesResult.value;

			return {ok: true, status: 200, value: {persona, community, spaces, directories, membership}};
		}),
};

//Returns a single persona object
export const ReadPersonaService: ServiceByName['ReadPersona'] = {
	event: ReadPersona,
	perform: async ({repos, params}) => {
		log.trace('[ReadPersona] persona', params.persona_id);

		const findPersonaResult = await repos.persona.findById(params.persona_id);
		if (!findPersonaResult.ok) {
			return {ok: false, status: 404, message: 'no persona found'};
		}
		return {ok: true, status: 200, value: {persona: findPersonaResult.value}};
	},
};
