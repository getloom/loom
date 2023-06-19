import type {Mutations} from '$lib/vocab/action/actionTypes';
import {evictHub, stashHub} from '$lib/vocab/hub/hubMutationHelpers';
import {stashActors} from '$lib/vocab/actor/actorMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {evictAssignments, stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

export const ReadHub: Mutations['ReadHub'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {hub, spaces, directories, roles, assignments, actors} = result.value;
	ui.mutate(() => {
		stashActors(ui, actors);
		stashHub(ui, hub);
		stashSpaces(ui, spaces, directories);
		stashRoles(ui, roles);
		stashAssignments(ui, assignments);
	});
	return result;
};

export const CreateHub: Mutations['CreateHub'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {hub, roles, policies, spaces, directories, assignments, actors} = result.value;
	ui.mutate(() => {
		stashActors(ui, actors);
		stashHub(ui, hub);
		stashSpaces(ui, spaces, directories);
		stashAssignments(ui, assignments);
		stashRoles(ui, roles);
		stashPolicies(ui, policies);
	});
	return result;
};

export const UpdateHub: Mutations['UpdateHub'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	ui.mutate(() => stashHub(ui, result.value.hub));
	return result;
};

export const DeleteHub: Mutations['DeleteHub'] = async ({params, invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {hub_id} = params;
	ui.mutate(() => evictHub(ui, hub_id));
	return result;
};

export const InviteToHub: Mutations['InviteToHub'] = async ({invoke, actions, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;

	const {assignment, actor} = result.value;
	const {hub_id} = assignment;
	const {hubById} = ui;

	if (!hubById.has(hub_id)) {
		const readHubResult = await actions.ReadHub({actor: actor.actor_id, hub_id});
		if (!readHubResult.ok) return readHubResult;
	}

	ui.mutate(() => {
		stashActors(ui, [actor]);
		stashAssignments(ui, [assignment]);
	});

	return result;
};

export const LeaveHub: Mutations['LeaveHub'] = async ({params, invoke, ui}) => {
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
	ui.mutate(() => evictAssignments(ui, assignmentsToEvict));

	return result;
};

export const KickFromHub: Mutations['KickFromHub'] = async ({params, invoke, ui}) => {
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
	ui.mutate(() => evictAssignments(ui, assignmentsToEvict));

	return result;
};
