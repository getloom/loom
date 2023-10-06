import type {Mutations} from '$lib/vocab/action/actionTypes.js';
import {stashActors, evictActor} from '$lib/vocab/actor/actorMutationHelpers.js';
import {evictHub, stashHubs} from '$lib/vocab/hub/hubMutationHelpers.js';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers.js';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers.js';
import {stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers.js';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers.js';

export const CreateAccountActor: Mutations['CreateAccountActor'] = async ({
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {actors, hubs, roles, policies, spaces, directories, assignments} = result.value;
	mutate(() => {
		stashActors(ui, actors);
		stashHubs(ui, hubs);
		stashSpaces(ui, afterMutation, spaces, directories);
		stashAssignments(ui, assignments);
		stashRoles(ui, roles);
		stashPolicies(ui, policies);
	});
	return result;
};

export const DeleteActor: Mutations['DeleteActor'] = async ({
	params,
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {actor_id} = params;
	const actor = ui.actorById.get(actor_id);
	if (actor) {
		mutate(() => {
			const $actor = actor.get();
			const hub_id = 'hub_id' in $actor ? $actor.hub_id : null;
			// TODO `evictActor` should possibly do this `evictHub` itself
			if (hub_id) evictHub(ui, afterMutation, hub_id);
			evictActor(ui, afterMutation, actor);
		});
	}
	return result;
};
