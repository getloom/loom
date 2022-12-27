import {Logger} from '@feltcoop/util/log.js';
import {unwrap} from '@feltcoop/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateAccountPersona, ReadPersona, DeletePersona} from '$lib/vocab/persona/personaEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {createSpaces} from '$lib/vocab/space/spaceHelpers.server';
import {
	cleanOrphanCommunities,
	initAdminCommunity,
	initDefaultRoleForCommunity,
} from '$lib/vocab/community/communityHelpers.server';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {Role} from '$lib/vocab/role/role';
import type {Community} from '$lib/vocab/community/community';
import type {ActorPersona, ClientPersona} from '$lib/vocab/persona/persona';
import {toDefaultAdminSpaces, toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {scrubPersonaName, checkPersonaName} from '$lib/vocab/persona/personaHelpers';
import {isPersonaNameReserved} from '$lib/vocab/persona/personaHelpers.server';
import {ADMIN_PERSONA_ID, GHOST_PERSONA_ID, PERSONAL_DEFAULT_ROLE} from '$lib/app/constants';
import type {Policy} from '$lib/vocab/policy/policy';
import {permissionNames} from '$lib/vocab/policy/permissions';

const log = new Logger(gray('[') + blue('personaServices') + gray(']'));

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

			if (isPersonaNameReserved(name)) {
				return {ok: false, status: 409, message: 'a persona with that name is not allowed'};
			}

			log.trace('[CreateAccountPersona] validating persona uniqueness', name);
			const existingPersona = unwrap(await repos.persona.findByName(name));
			if (existingPersona) {
				return {ok: false, status: 409, message: 'a persona with that name already exists'};
			}

			const personas: ClientPersona[] = [];
			const communities: Community[] = [];
			const assignments: Assignment[] = [];
			const roles: Role[] = [];
			const policies: Policy[] = [];
			const spaces: Space[] = [];
			const directories: Array<Entity & {data: DirectoryEntityData}> = [];

			// First create the admin community if it doesn't exist yet.
			const initAdminCommunityValue = unwrap(await initAdminCommunity(serviceRequest));

			// Create the persona's personal community.
			const community = unwrap(
				await repos.community.create('personal', name, toDefaultCommunitySettings(name)),
			);
			communities.push(community);

			// Create the default role with all permissions and assign it
			const defaultRole = unwrap(
				await initDefaultRoleForCommunity(repos, community, PERSONAL_DEFAULT_ROLE),
			);
			roles.push(defaultRole);
			for (const permission of permissionNames) {
				// eslint-disable-next-line no-await-in-loop
				const policy = unwrap(await repos.policy.create(defaultRole.role_id, permission));
				policies.push(policy);
			}

			// Create the persona.
			log.trace('[CreateAccountPersona] creating persona', name);
			const persona = unwrap(
				await repos.persona.createAccountPersona(name, account_id, community.community_id),
			);
			personas.push(persona);

			// Create the persona's assignment to its personal community.
			assignments.push(
				unwrap(
					await repos.assignment.create(
						persona.persona_id,
						community.community_id,
						community.settings.defaultRoleId,
					),
				),
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
				personas.push(initAdminCommunityValue.ghost);
				roles.push(initAdminCommunityValue.role);
				policies.push(...initAdminCommunityValue.policies);
				assignments.push(initAdminCommunityValue.assignment);

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
					unwrap(
						await repos.assignment.create(
							persona.persona_id,
							adminCommunity.community_id,
							adminCommunity.settings.defaultRoleId,
						),
					),
				);
			}

			return {
				ok: true,
				status: 200,
				value: {personas, communities, roles, policies, spaces, directories, assignments},
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

export const DeletePersonaService: ServiceByName['DeletePersona'] = {
	event: DeletePersona,
	perform: async ({repos, params}) => {
		const {persona_id} = params;

		// first check if deleting the persona is allowed
		if (persona_id === ADMIN_PERSONA_ID || persona_id === GHOST_PERSONA_ID) {
			return {ok: false, status: 400, message: 'cannot delete that persona'};
		}
		const persona = unwrap(
			await repos.persona.findById<Pick<ActorPersona, 'type' | 'community_id'>>(persona_id, [
				'type',
				'community_id',
			]),
		);
		if (!persona) {
			return {ok: false, status: 404, message: 'no persona found'};
		}
		if (persona.type === 'community') {
			return {ok: false, status: 400, message: 'cannot delete community personas'};
		}

		// deleting is allowed, and a lot of things need to happen. some of the order is sensitive:
		const communities = unwrap(await repos.community.filterByPersona(persona_id));

		// swap in the ghost persona id for this `persona_id` for those objects that we don't delete
		unwrap(await repos.entity.attributeToGhostByPersona(persona_id));

		// delete the persona and its related objects
		unwrap(await repos.assignment.deleteByPersona(persona_id));
		unwrap(await repos.persona.deleteById(persona_id));
		unwrap(await repos.community.deleteById(persona.community_id)); // must follow `persona.deleteById` it seems
		unwrap(
			await cleanOrphanCommunities(
				communities.map((c) => c.community_id).filter((c) => c !== persona.community_id),
				repos,
			),
		);

		return {ok: true, status: 200, value: null};
	},
};
