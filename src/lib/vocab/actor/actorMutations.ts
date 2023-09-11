import type {Mutations} from '$lib/vocab/action/actionTypes';
import {stashActors, evictActor} from '$lib/vocab/actor/actorMutationHelpers';
import {evictHub, stashHubs} from '$lib/vocab/hub/hubMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

export const CreateAccountActor: Mutations['CreateAccountActor'] = async ({invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {actors, hubs, roles, policies, spaces, directories, assignments} = result.value;
	mutate(() => {
		stashActors(ui, actors);
		stashHubs(ui, hubs);
		stashSpaces(ui, spaces, directories);
		stashAssignments(ui, assignments);
		stashRoles(ui, roles);
		stashPolicies(ui, policies);
	});
	return result;
};

export const DeleteActor: Mutations['DeleteActor'] = async ({params, invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {actor_id} = params;
	const actor = ui.actorById.get(actor_id);
	if (actor) {
		mutate(() => {
			const $actor = actor.get();
			const hub_id = 'hub_id' in $actor ? $actor.hub_id : null;
			// TODO `evictActor` should possibly do this `evictHub` itself
			if (hub_id) evictHub(ui, hub_id);
			evictActor(ui, actor);
		});
	}
	return result;
};
