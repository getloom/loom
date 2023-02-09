import {Logger} from '@feltjs/util/log.js';
import {unwrap} from '@feltjs/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateAccountPersona, DeletePersona} from '$lib/vocab/persona/personaEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {createSpaces} from '$lib/vocab/space/spaceHelpers.server';
import {
	cleanOrphanCommunities,
	initAdminCommunity,
	initTemplateGovernanceForCommunity,
} from '$lib/vocab/community/communityHelpers.server';
import type {Community} from '$lib/vocab/community/community';
import type {ActorPersona, ClientPersona} from '$lib/vocab/persona/persona';
import {toDefaultAdminSpaces, toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {scrubPersonaName, checkPersonaName} from '$lib/vocab/persona/personaHelpers';
import {isPersonaAdmin, isPersonaNameReserved} from '$lib/vocab/persona/personaHelpers.server';
import {ADMIN_PERSONA_ID, GHOST_PERSONA_ID} from '$lib/app/constants';
import {defaultPersonalCommunityRoles} from '$lib/app/templates';

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

			// First create the admin community if it doesn't exist yet.
			const initAdminCommunityValue = unwrap(await initAdminCommunity(repos));

			// Create the persona's personal community.
			const community = unwrap(
				await repos.community.create('personal', name, toDefaultCommunitySettings(name)),
			);
			communities.push(community);

			// Create the persona.
			log.trace('[CreateAccountPersona] creating persona', name);
			const persona = unwrap(
				await repos.persona.createAccountPersona(name, account_id, community.community_id),
			);
			personas.push(persona);

			// Create the roles, policies, and persona assignment.
			const {roles, policies, assignments} = unwrap(
				await initTemplateGovernanceForCommunity(
					repos,
					defaultPersonalCommunityRoles,
					community,
					persona.persona_id,
				),
			);

			// Create the default spaces.
			const {spaces, directories} = unwrap(
				await createSpaces(toDefaultSpaces(persona.persona_id, community), repos),
			);

			// If the admin community was created, create the admin spaces and the persona's assignment.
			// This is a separate step because we need to create the admin community before any others
			// and the dependencies flow like this:
			// `adminCommunity => personalCommunity => persona => adminCommunitySpaces + adminCommunityAssignment`
			if (initAdminCommunityValue) {
				const adminCommunity = initAdminCommunityValue.community;
				communities.push(adminCommunity);
				personas.push(initAdminCommunityValue.persona);
				personas.push(initAdminCommunityValue.ghost);
				roles.push(...initAdminCommunityValue.roles);
				policies.push(...initAdminCommunityValue.policies);
				assignments.push(...initAdminCommunityValue.assignments);

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

				// Create the admin community's default spaces.
				const defaultAdminSpaces = unwrap(
					await createSpaces(toDefaultAdminSpaces(persona.persona_id, adminCommunity), repos),
				);
				spaces.push(...defaultAdminSpaces.spaces);
				directories.push(...defaultAdminSpaces.directories);
			}

			return {
				ok: true,
				status: 200,
				value: {personas, communities, roles, policies, spaces, directories, assignments},
			};
		}),
};

export const DeletePersonaService: ServiceByName['DeletePersona'] = {
	event: DeletePersona,
	perform: async ({repos, params}) => {
		const {actor, persona_id} = params;

		// first check if deleting the persona is allowed
		//TODO extract to it's own policy helper?
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
		if (await isPersonaAdmin(persona_id, repos)) {
			return {ok: false, status: 400, message: 'cannot delete admin personas'};
		}
		if (actor !== persona_id && !(await isPersonaAdmin(actor, repos))) {
			return {ok: false, status: 403, message: 'actor does not have permission'};
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
