import type {Mutations} from '$lib/app/eventTypes';
import {evictHub, stashHub} from '$lib/vocab/hub/hubMutationHelpers';
import {stashPersonas} from '$lib/vocab/actor/personaMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {evictAssignments, stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

export const ReadHub: Mutations['ReadHub'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {hub, spaces, directories, roles, assignments, personas} = result.value;
	ui.mutate(() => {
		stashPersonas(ui, personas);
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
	const {hub, roles, policies, spaces, directories, assignments, personas} = result.value;
	ui.mutate(() => {
		stashPersonas(ui, personas);
		stashHub(ui, hub);
		stashSpaces(ui, spaces, directories);
		stashAssignments(ui, assignments);
		stashRoles(ui, roles);
		stashPolicies(ui, policies);
	});
	return result;
};

export const UpdateHubSettings: Mutations['UpdateHubSettings'] = async ({
	params,
	invoke,
	ui: {hubById},
}) => {
	// optimistic update
	const hub = hubById.get(params.hub_id)!;
	const originalSettings = hub.get().settings;
	hub.update(($hub) => ({
		...$hub,
		settings: {...$hub.settings, ...params.settings},
	}));
	const result = await invoke();
	if (!result.ok) {
		hub.update(($hub) => ({...$hub, settings: originalSettings}));
	}
	return result;
};

export const DeleteHub: Mutations['DeleteHub'] = async ({params, invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {hub_id} = params;
	ui.mutate(() => evictHub(ui, hub_id));
	return result;
};

export const InviteToHub: Mutations['InviteToHub'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;

	const {assignment, persona} = result.value;
	ui.mutate(() => {
		stashPersonas(ui, [persona]);
		stashAssignments(ui, [assignment]);
	});

	return result;
};

export const LeaveHub: Mutations['LeaveHub'] = async ({params, invoke, ui}) => {
	const {assignments} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const {targetActor, hub_id} = params;

	const assignmentsToEvict: Assignment[] = [];
	// TODO could speed this up a cache of assignments by hub, see in multiple places
	for (const assignment of assignments.get().value) {
		if (assignment.persona_id === targetActor && assignment.hub_id === hub_id) {
			assignmentsToEvict.push(assignment);
		}
	}
	ui.mutate(() => evictAssignments(ui, assignmentsToEvict));

	return result;
};
