import {Logger} from '@feltcoop/felt/util/log.js';
import {unwrap} from '@feltcoop/felt';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateAccountPersona, ReadPersona} from '$lib/vocab/persona/personaEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {createSpaces} from '$lib/vocab/space/spaceServices';
import {
	initAdminCommunity,
	initDefaultRoleForCommunity,
} from '$lib/vocab/community/communityServices';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {Role} from '$lib/vocab/role/role';
import type {Community} from '$lib/vocab/community/community';
import type {Persona} from '$lib/vocab/persona/persona';
import {toDefaultAdminSpaces, toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {scrubPersonaName, checkPersonaName} from '$lib/vocab/persona/personaHelpers';

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
			const name = scrubPersonaName(params.name);
			const nameErrorMessage = checkPersonaName(name);
			if (nameErrorMessage) {
				return {ok: false, status: 400, message: nameErrorMessage};
			}

			if (BLOCKLIST.has(name.toLowerCase())) {
				return {ok: false, status: 409, message: 'a persona with that name is not allowed'};
			}

			log.trace('[CreateAccountPersona] validating persona uniqueness', name);
			const existingPersona = unwrap(await repos.persona.findByName(name));
			if (existingPersona) {
				return {ok: false, status: 409, message: 'a persona with that name already exists'};
			}

			const personas: Persona[] = [];
			const communities: Community[] = [];
			const assignments: Assignment[] = [];
			const roles: Role[] = [];
			const spaces: Space[] = [];
			const directories: Array<Entity & {data: DirectoryEntityData}> = [];

			// First create the admin community if it doesn't exist yet.
			const initAdminCommunityValue = unwrap(await initAdminCommunity(serviceRequest));

			// Create the persona's personal community.
			const community = unwrap(
				await repos.community.create('personal', name, toDefaultCommunitySettings(name)),
			);
			communities.push(community);

			// Create the default role and assign it
			roles.push(unwrap(await initDefaultRoleForCommunity(repos, community)));

			// Create the persona.
			log.trace('[CreateAccountPersona] creating persona', name);
			const persona = unwrap(
				await repos.persona.createAccountPersona(name, account_id, community.community_id),
			);
			personas.push(persona);

			// Create the persona's assignment to its personal community.
			assignments.push(
				unwrap(await repos.assignment.create(persona.persona_id, community.community_id)),
			);

			// Create the default spaces.
			const defaultSpaces = unwrap(
				await createSpaces(
					{...serviceRequest, actor: persona},
					toDefaultSpaces(persona.persona_id, community),
				),
			);
			spaces.push(...defaultSpaces.spaces);
			directories.push(...defaultSpaces.directories);

			// If the admin community was created, create the admin spaces and the persona's assignment.
			// This is a separate step because we need to create the admin community before any others
			// and the dependencies flow like this:
			// `adminCommunity => personalCommunity => persona => adminCommunitySpaces + adminCommunityAssignment`
			if (initAdminCommunityValue) {
				const adminCommunity = initAdminCommunityValue.community;
				communities.push(adminCommunity);
				personas.push(initAdminCommunityValue.persona);
				roles.push(initAdminCommunityValue.role);

				// Create the admin community's default spaces.
				const defaultAdminSpaces = unwrap(
					await createSpaces(
						{...serviceRequest, actor: persona},
						toDefaultAdminSpaces(persona.persona_id, adminCommunity),
					),
				);
				spaces.push(...defaultAdminSpaces.spaces);
				directories.push(...defaultAdminSpaces.directories);

				// Create the persona's assignment to the admin community.
				assignments.push(
					unwrap(await repos.assignment.create(persona.persona_id, adminCommunity.community_id)),
				);
			}

			return {
				ok: true,
				status: 200,
				value: {personas, communities, roles, spaces, directories, assignments},
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
