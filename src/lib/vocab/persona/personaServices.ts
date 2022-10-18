import {Logger} from '@feltcoop/felt/util/log.js';
import {unwrap} from '@feltcoop/felt';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateAccountPersona, ReadPersona} from '$lib/vocab/persona/personaEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {createDefaultAdminSpaces, createDefaultSpaces} from '$lib/vocab/space/spaceServices';
import {
	initAdminCommunity,
	initDefaultRoleForCommunity,
} from '$lib/vocab/community/communityServices';

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
			const existingPersona = unwrap(await repos.persona.findByName(name));
			if (existingPersona) {
				return {ok: false, status: 409, message: 'a persona with that name already exists'};
			}

			// First create the admin community if it doesn't exist yet.
			const initAdminCommunityValue = unwrap(await initAdminCommunity(serviceRequest));

			// Create the persona's personal community.
			const community = unwrap(
				await repos.community.create('personal', name, toDefaultCommunitySettings(name)),
			);

			// Create the default role and assign it
			const role = unwrap(await initDefaultRoleForCommunity(repos, community));

			// Create the persona.
			log.trace('[CreateAccountPersona] creating persona', name);
			const persona = unwrap(
				await repos.persona.createAccountPersona(name, account_id, community.community_id),
			);

			// Create the persona's membership to its personal community.
			const membership = unwrap(
				await repos.membership.create(persona.persona_id, community.community_id),
			);

			// If the admin community was created, create the admin spaces and the persona's membership.
			// This is a separate step because we need to create the admin community before any others
			// and the dependencies flow like this:
			// `adminCommunity => personalCommunity => persona => adminCommunitySpaces + adminCommunityMembership`
			if (initAdminCommunityValue) {
				const adminCommunity = initAdminCommunityValue.community;
				// Create the admin community's default spaces.
				unwrap(
					await createDefaultAdminSpaces(
						{...serviceRequest, actor: persona},
						persona.persona_id,
						adminCommunity,
					),
				);

				// Create the persona's membership to the admin community.
				unwrap(await repos.membership.create(persona.persona_id, adminCommunity.community_id));
			}

			// Create the default spaces.
			const {spaces, directories} = unwrap(
				await createDefaultSpaces(
					{...serviceRequest, actor: persona},
					persona.persona_id,
					community,
				),
			);

			return {
				ok: true,
				status: 200,
				value: {persona, community, role, spaces, directories, membership},
			};
		}),
};

//Returns a single persona object
export const ReadPersonaService: ServiceByName['ReadPersona'] = {
	event: ReadPersona,
	perform: async ({repos, params}) => {
		log.trace('[ReadPersona] persona', params.persona_id);
		const persona = unwrap(await repos.persona.findById(params.persona_id));
		if (!persona) {
			return {ok: false, status: 404, message: 'no persona found'};
		}
		return {ok: true, status: 200, value: {persona}};
	},
};
