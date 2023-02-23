import type {Mutations} from '$lib/app/eventTypes';
import {evictCommunity, stashCommunity} from '$lib/vocab/community/communityMutationHelpers';
import {stashPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {evictAssignments, stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

export const ReadCommunity: Mutations['ReadCommunity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {community, spaces, directories, roles, assignments, personas} = result.value;
	ui.mutate(() => {
		stashPersonas(ui, personas);
		stashCommunity(ui, community);
		stashSpaces(ui, spaces, directories);
		stashRoles(ui, roles);
		stashAssignments(ui, assignments);
	});
	return result;
};

export const CreateCommunity: Mutations['CreateCommunity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {community, roles, policies, spaces, directories, assignments, personas} = result.value;
	ui.mutate(() => {
		stashPersonas(ui, personas);
		stashCommunity(ui, community);
		stashSpaces(ui, spaces, directories);
		stashAssignments(ui, assignments);
		stashRoles(ui, roles);
		stashPolicies(ui, policies);
	});
	return result;
};

export const UpdateCommunitySettings: Mutations['UpdateCommunitySettings'] = async ({
	params,
	invoke,
	ui: {communityById},
}) => {
	// optimistic update
	const community = communityById.get(params.community_id)!;
	const originalSettings = community.get().settings;
	community.update(($community) => ({
		...$community,
		settings: {...$community.settings, ...params.settings},
	}));
	const result = await invoke();
	if (!result.ok) {
		community.update(($community) => ({...$community, settings: originalSettings}));
	}
	return result;
};

export const DeleteCommunity: Mutations['DeleteCommunity'] = async ({params, invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {community_id} = params;
	ui.mutate(() => evictCommunity(ui, community_id));
	return result;
};

export const InviteToCommunity: Mutations['InviteToCommunity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;

	const {assignment, persona} = result.value;
	ui.mutate(() => {
		stashPersonas(ui, [persona]);
		stashAssignments(ui, [assignment]);
	});

	return result;
};

export const LeaveCommunity: Mutations['LeaveCommunity'] = async ({params, invoke, ui}) => {
	const {assignments} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const {persona_id, community_id} = params;

	const assignmentsToEvict: Assignment[] = [];
	// TODO could speed this up a cache of assignments by community, see in multiple places
	for (const assignment of assignments.get().value) {
		if (assignment.persona_id === persona_id && assignment.community_id === community_id) {
			assignmentsToEvict.push(assignment);
		}
	}
	ui.mutate(() => evictAssignments(ui, assignmentsToEvict));

	return result;
};
