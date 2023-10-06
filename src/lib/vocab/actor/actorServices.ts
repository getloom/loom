import {Logger} from '@grogarden/util/log.js';

import {blue, gray} from '$lib/server/colors.js';
import type {ServiceByName} from '$lib/vocab/action/actionTypes.js';
import {CreateAccountActor, DeleteActor} from '$lib/vocab/actor/actorActions.js';
import {createSpaces} from '$lib/vocab/space/spaceHelpers.server.js';
import {
	HUB_COLUMNS,
	cleanOrphanHubs,
	initAdminHub,
	initTemplateGovernanceForHub,
	toDefaultHubSettings,
} from '$lib/vocab/hub/hubHelpers.server.js';
import type {Hub} from '$lib/vocab/hub/hub.js';
import type {ClientActor} from '$lib/vocab/actor/actor.js';
import {toDefaultAdminSpaces, toDefaultSpaces} from '$lib/vocab/space/defaultSpaces.js';
import {
	ACTOR_COLUMNS,
	isActorAdmin,
	isActorNameReserved,
} from '$lib/vocab/actor/actorHelpers.server.js';
import {scrubActorName, checkActorName} from '$lib/vocab/actor/actorHelpers.js';
import {ADMIN_ACTOR_ID, GHOST_ACTOR_ID} from '$lib/util/constants.js';
import {defaultPersonalHubRoles} from '$lib/ui/templates.js';
import {createAssignment} from '$lib/vocab/assignment/assignmentHelpers.server.js';
import {assertApiError} from '$lib/server/api.js';

const log = new Logger(gray('[') + blue('actorServices') + gray(']'));

//Creates a new actor
export const CreateAccountActorService: ServiceByName['CreateAccountActor'] = {
	action: CreateAccountActor,
	transaction: true,
	// TODO verify the `account_id` has permission to modify this actor
	// TODO add `actor_id` and verify it's one of the `account_id`'s actors
	perform: async ({repos, params, account_id}) => {
		log.debug('[CreateAccountActor] creating actor', params.name);
		const name = scrubActorName(params.name);
		assertApiError(checkActorName(name));

		if (isActorNameReserved(name)) {
			return {ok: false, status: 409, message: 'a actor with that name is not allowed'};
		}

		log.debug('[CreateAccountActor] validating actor uniqueness', name);
		const existingActor = await repos.actor.findByName(name, ACTOR_COLUMNS.actor_id);
		if (existingActor) {
			return {ok: false, status: 409, message: 'a actor with that name already exists'};
		}

		const actors: ClientActor[] = [];
		const hubs: Hub[] = [];

		// First create the admin hub if it doesn't exist yet.
		const initAdminHubValue = await initAdminHub(repos);

		// Create the actor's personal hub.
		const hub = await repos.hub.create('personal', name, toDefaultHubSettings(name));
		hubs.push(hub);

		// Create the actor.
		log.debug('[CreateAccountActor] creating actor', name);
		const actor = await repos.actor.createAccountActor(name, account_id, hub.hub_id);
		actors.push(actor);

		// Create the roles, policies, and actor assignment.
		const {roles, policies, assignments} = await initTemplateGovernanceForHub(
			repos,
			defaultPersonalHubRoles,
			hub,
			actor.actor_id,
		);

		// Create the default spaces.
		const {spaces, directories} = await createSpaces(repos, toDefaultSpaces(actor.actor_id, hub));

		// If the admin hub was created, create the admin spaces and the actor's assignment.
		// This is a separate step because we need to create the admin hub before any others
		// and the dependencies flow like this:
		// `adminHub => personalHub => actor => adminHubSpaces + adminHubAssignment`
		if (initAdminHubValue) {
			const adminHub = initAdminHubValue.hub;
			hubs.push(adminHub);
			actors.push(initAdminHubValue.actor);
			actors.push(initAdminHubValue.ghost);
			roles.push(...initAdminHubValue.roles);
			policies.push(...initAdminHubValue.policies);
			assignments.push(...initAdminHubValue.assignments);

			// Create the actor's assignment to the admin hub.
			assignments.push(
				await repos.assignment.create(
					actor.actor_id,
					adminHub.hub_id,
					adminHub.settings.defaultRoleId,
				),
			);

			// Create the admin community's default spaces.
			const defaultAdminSpaces = await createSpaces(
				repos,
				toDefaultAdminSpaces(actor.actor_id, adminHub),
			);
			spaces.push(...defaultAdminSpaces.spaces);
			directories.push(...defaultAdminSpaces.directories);
		}

		// once all initial hubs & assignments have been created properly
		// check to see if there are any instance configured default hubs the actor needs assigned to
		const adminHub = await repos.hub.loadAdminHub(HUB_COLUMNS.settings);
		if (adminHub) {
			const defaultHubIds = adminHub.settings.instance?.defaultHubIds;
			if (defaultHubIds) {
				const defaultHubs = await repos.hub.filterByIds(defaultHubIds);
				await Promise.all(
					defaultHubs.map(async (hub) => {
						const role_id = hub.settings.defaultRoleId;
						const assignment = await createAssignment(repos, actor.actor_id, hub, role_id);
						assignments.push(assignment);
						hubs.push(hub);
						const {hubActors, hubRoles, hubPolicies, hubSpaces, hubDirectories} =
							await repos.hub.loadHubContext(hub.hub_id);
						actors.push(...hubActors);
						roles.push(...hubRoles);
						policies.push(...hubPolicies);
						spaces.push(...hubSpaces);
						directories.push(...hubDirectories);
					}),
				);
			}
		}

		return {
			ok: true,
			status: 200,
			value: {actors, hubs, roles, policies, spaces, directories, assignments},
		};
	},
};

export const DeleteActorService: ServiceByName['DeleteActor'] = {
	action: DeleteActor,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, actor_id} = params;

		// first check if deleting the actor is allowed
		//TODO extract to it's own policy helper?
		if (actor_id === ADMIN_ACTOR_ID || actor_id === GHOST_ACTOR_ID) {
			return {ok: false, status: 400, message: 'cannot delete that actor'};
		}
		const actorData = await repos.actor.findById(actor_id, ACTOR_COLUMNS.type_hub_id);
		if (!actorData) {
			return {ok: false, status: 404, message: 'no actor found'};
		}
		if (actorData.type === 'community') {
			return {ok: false, status: 400, message: 'cannot delete hub actors'};
		}
		if (await isActorAdmin(repos, actor_id)) {
			return {ok: false, status: 400, message: 'cannot delete admin actors'};
		}
		if (actor !== actor_id && !(await isActorAdmin(repos, actor))) {
			return {ok: false, status: 403, message: 'actor does not have permission'};
		}
		// deleting is allowed, and a lot of things need to happen. some of the order is sensitive:
		const hubs = await repos.hub.filterByActor(actor_id, HUB_COLUMNS.hub_id);

		// swap in the ghost actor id for this `actor_id` for those objects that we don't delete
		await repos.entity.attributeToGhostByActor(actor_id);

		// delete the actor and its related objects
		await repos.actor.deleteById(actor_id);
		await repos.assignment.deleteByActor(actor_id);
		await repos.hub.deleteById(actorData.hub_id); // must follow `actor.deleteById`

		// clean the hubs the actor is joined to, and assemble the broadcast audience
		const joinedHubIds = hubs.map((h) => h.hub_id).filter((h) => h !== actorData.hub_id);
		const removedHubIds = await cleanOrphanHubs(repos, joinedHubIds);
		const broadcastHubIds = removedHubIds
			? joinedHubIds.filter((h) => !removedHubIds.includes(h))
			: joinedHubIds;

		return {ok: true, status: 200, value: null, broadcast: broadcastHubIds};
	},
};
