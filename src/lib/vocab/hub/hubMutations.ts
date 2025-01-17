import type {Mutations} from '$lib/vocab/action/actionTypes.js';
import {evictHub, stashHub} from '$lib/vocab/hub/hubMutationHelpers.js';
import {stashActors} from '$lib/vocab/actor/actorMutationHelpers.js';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers.js';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers.js';
import {
	evictAssignments,
	stashAssignments,
} from '$lib/vocab/assignment/assignmentMutationHelpers.js';
import type {Assignment} from '$lib/vocab/assignment/assignment.js';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers.js';

export const ReadHub: Mutations['ReadHub'] = async ({invoke, mutate, afterMutation, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {hub, spaces, directories, roles, assignments, actors} = result.value;
	mutate(() => {
		stashActors(ui, actors);
		stashHub(ui, hub);
		stashSpaces(ui, afterMutation, spaces, directories);
		stashRoles(ui, roles);
		stashAssignments(ui, assignments);
	});
	return result;
};

export const CreateHub: Mutations['CreateHub'] = async ({invoke, mutate, afterMutation, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {hub, roles, policies, spaces, directories, assignments, actors} = result.value;
	mutate(() => {
		stashActors(ui, actors);
		stashHub(ui, hub);
		stashSpaces(ui, afterMutation, spaces, directories);
		stashAssignments(ui, assignments);
		stashRoles(ui, roles);
		stashPolicies(ui, policies);
	});
	return result;
};

export const UpdateHub: Mutations['UpdateHub'] = async ({invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	mutate(() => stashHub(ui, result.value.hub));
	return result;
};

export const DeleteHub: Mutations['DeleteHub'] = async ({
	params,
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {hub_id} = params;
	mutate(() => evictHub(ui, afterMutation, hub_id));
	return result;
};

export const InviteToHub: Mutations['InviteToHub'] = async ({invoke, actions, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;

	const {assignment, actor} = result.value;
	const {hub_id} = assignment;
	const {hubById} = ui;

	if (!hubById.has(hub_id)) {
		const readHubResult = await actions.ReadHub({actor: actor.actor_id, hub_id});
		if (!readHubResult.ok) return readHubResult;
	}

	mutate(() => {
		stashActors(ui, [actor]);
		stashAssignments(ui, [assignment]);
	});

	return result;
};

export const LeaveHub: Mutations['LeaveHub'] = async ({
	params,
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {actor_id, hub_id} = params;

	const assignmentsToEvict: Assignment[] = [];
	// TODO could speed this up a cache of assignments by hub, see in multiple places
	for (const assignment of ui.assignments.get().value) {
		if (assignment.actor_id === actor_id && assignment.hub_id === hub_id) {
			assignmentsToEvict.push(assignment);
		}
	}
	mutate(() => evictAssignments(ui, afterMutation, assignmentsToEvict));

	return result;
};

export const KickFromHub: Mutations['KickFromHub'] = async ({
	params,
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {actor_id, hub_id} = params;

	const assignmentsToEvict: Assignment[] = [];
	// TODO could speed this up a cache of assignments by hub, see in multiple places
	for (const assignment of ui.assignments.get().value) {
		if (assignment.actor_id === actor_id && assignment.hub_id === hub_id) {
			assignmentsToEvict.push(assignment);
		}
	}
	mutate(() => evictAssignments(ui, afterMutation, assignmentsToEvict));

	return result;
};
