import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/actionTypes';
import {CreateAccountActor, DeleteActor} from '$lib/vocab/actor/actorActions';
import {createSpaces} from '$lib/vocab/space/spaceHelpers.server';
import {
	cleanOrphanHubs,
	initAdminHub,
	initTemplateGovernanceForHub,
	toDefaultHubSettings,
} from '$lib/vocab/hub/hubHelpers.server';
import type {Hub} from '$lib/vocab/hub/hub';
import type {ClientActor} from '$lib/vocab/actor/actor';
import {toDefaultAdminSpaces, toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {
	ACTOR_COLUMNS,
	isActorAdmin,
	isActorNameReserved,
} from '$lib/vocab/actor/actorHelpers.server';
import {scrubActorName, checkActorName} from '$lib/vocab/actor/actorHelpers';
import {ADMIN_ACTOR_ID, GHOST_ACTOR_ID} from '$lib/app/constants';
import {defaultPersonalHubRoles} from '$lib/app/templates';

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
		const nameErrorMessage = checkActorName(name);
		if (nameErrorMessage) {
			return {ok: false, status: 400, message: nameErrorMessage};
		}

		if (isActorNameReserved(name)) {
			return {ok: false, status: 409, message: 'a actor with that name is not allowed'};
		}

		log.debug('[CreateAccountActor] validating actor uniqueness', name);
		const existingActor = await repos.actor.findByName(name, ACTOR_COLUMNS.ActorId);
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
		const {spaces, directories} = await createSpaces(toDefaultSpaces(actor.actor_id, hub), repos);

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
				toDefaultAdminSpaces(actor.actor_id, adminHub),
				repos,
			);
			spaces.push(...defaultAdminSpaces.spaces);
			directories.push(...defaultAdminSpaces.directories);
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
		const actorData = await repos.actor.findById(actor_id, ACTOR_COLUMNS.TypeAndHub);
		if (!actorData) {
			return {ok: false, status: 404, message: 'no actor found'};
		}
		if (actorData.type === 'community') {
			return {ok: false, status: 400, message: 'cannot delete hub actors'};
		}
		if (await isActorAdmin(actor_id, repos)) {
			return {ok: false, status: 400, message: 'cannot delete admin actors'};
		}
		if (actor !== actor_id && !(await isActorAdmin(actor, repos))) {
			return {ok: false, status: 403, message: 'actor does not have permission'};
		}
		// deleting is allowed, and a lot of things need to happen. some of the order is sensitive:
		const hubs = await repos.hub.filterByActor(actor_id);

		// swap in the ghost actor id for this `actor_id` for those objects that we don't delete
		await repos.entity.attributeToGhostByActor(actor_id);

		// delete the actor and its related objects
		await repos.actor.deleteById(actor_id);
		await repos.assignment.deleteByActor(actor_id);
		// TODO this type hack shouldn't be necessary, but somehow the types are off,
		// looks like types aren't narrowing with `Pick` on the type union (see this comment in multiple places)
		await repos.hub.deleteById(actorData.hub_id!); // must follow `actor.deleteById`

		// clean the hubs the actor is joined to, and assemble the broadcast audience
		const joinedHubIds = hubs.map((c) => c.hub_id).filter((c) => c !== actorData.hub_id);
		const removedHubIds = await cleanOrphanHubs(joinedHubIds, repos);
		const broadcastHubIds = removedHubIds
			? joinedHubIds.filter((h) => !removedHubIds.includes(h))
			: joinedHubIds;

		return {ok: true, status: 200, value: null, broadcast: broadcastHubIds};
	},
};
