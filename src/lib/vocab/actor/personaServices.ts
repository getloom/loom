import {Logger} from '@feltjs/util/log.js';
import {unwrap} from '@feltjs/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/actionTypes';
import {CreateAccountPersona, DeletePersona} from '$lib/vocab/actor/personaActions';
import {createSpaces} from '$lib/vocab/space/spaceHelpers.server';
import {
	cleanOrphanHubs,
	initAdminHub,
	initTemplateGovernanceForHub,
	toDefaultHubSettings,
} from '$lib/vocab/hub/hubHelpers.server';
import type {Hub} from '$lib/vocab/hub/hub';
import type {ActorPersona, ClientPersona} from '$lib/vocab/actor/persona';
import {toDefaultAdminSpaces, toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {scrubPersonaName, checkPersonaName} from '$lib/vocab/actor/personaHelpers';
import {isPersonaAdmin, isPersonaNameReserved} from '$lib/vocab/actor/personaHelpers.server';
import {ADMIN_ACTOR_ID, GHOST_ACTOR_ID} from '$lib/app/constants';
import {defaultPersonalHubRoles} from '$lib/app/templates';

const log = new Logger(gray('[') + blue('personaServices') + gray(']'));

//Creates a new persona
export const CreateAccountPersonaService: ServiceByName['CreateAccountPersona'] = {
	event: CreateAccountPersona,
	transaction: true,
	// TODO verify the `account_id` has permission to modify this persona
	// TODO add `persona_id` and verify it's one of the `account_id`'s personas
	perform: async ({repos, params, account_id}) => {
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
		const hubs: Hub[] = [];

		// First create the admin hub if it doesn't exist yet.
		const initAdminHubValue = await initAdminHub(repos);

		// Create the persona's personal hub.
		const hub = await repos.hub.create('personal', name, toDefaultHubSettings(name));
		hubs.push(hub);

		// Create the persona.
		log.trace('[CreateAccountPersona] creating persona', name);
		const persona = unwrap(await repos.persona.createAccountPersona(name, account_id, hub.hub_id));
		personas.push(persona);

		// Create the roles, policies, and persona assignment.
		const {roles, policies, assignments} = await initTemplateGovernanceForHub(
			repos,
			defaultPersonalHubRoles,
			hub,
			persona.persona_id,
		);

		// Create the default spaces.
		const {spaces, directories} = await createSpaces(
			toDefaultSpaces(persona.persona_id, hub),
			repos,
		);

		// If the admin hub was created, create the admin spaces and the persona's assignment.
		// This is a separate step because we need to create the admin hub before any others
		// and the dependencies flow like this:
		// `adminHub => personalHub => persona => adminHubSpaces + adminHubAssignment`
		if (initAdminHubValue) {
			const adminHub = initAdminHubValue.hub;
			hubs.push(adminHub);
			personas.push(initAdminHubValue.persona);
			personas.push(initAdminHubValue.ghost);
			roles.push(...initAdminHubValue.roles);
			policies.push(...initAdminHubValue.policies);
			assignments.push(...initAdminHubValue.assignments);

			// Create the persona's assignment to the admin hub.
			assignments.push(
				await repos.assignment.create(
					persona.persona_id,
					adminHub.hub_id,
					adminHub.settings.defaultRoleId,
				),
			);

			// Create the admin community's default spaces.
			const defaultAdminSpaces = await createSpaces(
				toDefaultAdminSpaces(persona.persona_id, adminHub),
				repos,
			);
			spaces.push(...defaultAdminSpaces.spaces);
			directories.push(...defaultAdminSpaces.directories);
		}

		return {
			ok: true,
			status: 200,
			value: {personas, hubs, roles, policies, spaces, directories, assignments},
		};
	},
};

export const DeletePersonaService: ServiceByName['DeletePersona'] = {
	event: DeletePersona,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, targetActor} = params;

		// first check if deleting the persona is allowed
		//TODO extract to it's own policy helper?
		if (targetActor === ADMIN_ACTOR_ID || targetActor === GHOST_ACTOR_ID) {
			return {ok: false, status: 400, message: 'cannot delete that persona'};
		}
		const persona = unwrap(
			await repos.persona.findById<Pick<ActorPersona, 'type' | 'hub_id'>>(targetActor, [
				'type',
				'hub_id',
			]),
		);
		if (!persona) {
			return {ok: false, status: 404, message: 'no persona found'};
		}
		if (persona.type === 'community') {
			return {ok: false, status: 400, message: 'cannot delete hub personas'};
		}
		if (await isPersonaAdmin(targetActor, repos)) {
			return {ok: false, status: 400, message: 'cannot delete admin personas'};
		}
		if (actor !== targetActor && !(await isPersonaAdmin(actor, repos))) {
			return {ok: false, status: 403, message: 'actor does not have permission'};
		}
		// deleting is allowed, and a lot of things need to happen. some of the order is sensitive:
		const hubs = await repos.hub.filterByPersona(targetActor);

		// swap in the ghost persona id for this `targetActor` for those objects that we don't delete
		await repos.entity.attributeToGhostByPersona(targetActor);

		// delete the persona and its related objects
		await repos.assignment.deleteByPersona(targetActor);
		unwrap(await repos.persona.deleteById(targetActor));
		await repos.hub.deleteById(persona.hub_id); // must follow `persona.deleteById` it seems
		await cleanOrphanHubs(
			hubs.map((c) => c.hub_id).filter((c) => c !== persona.hub_id),
			repos,
		);

		return {ok: true, status: 200, value: null};
	},
};
