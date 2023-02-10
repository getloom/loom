import type {Mutations} from '$lib/app/eventTypes';
import {Mutated} from '$lib/util/Mutated';
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
	const mutated = new Mutated('ReadCommunity');
	stashPersonas(ui, personas, mutated);
	stashCommunity(ui, community, mutated);
	stashSpaces(ui, spaces, directories, mutated);
	stashRoles(ui, roles, mutated);
	stashAssignments(ui, assignments, mutated);
	mutated.end('ReadCommunity');
	return result;
};

export const CreateCommunity: Mutations['CreateCommunity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {community, roles, policies, spaces, directories, assignments, personas} = result.value;
	const mutated = new Mutated('CreateCommunity');
	stashPersonas(ui, personas, mutated);
	stashCommunity(ui, community, mutated);
	stashSpaces(ui, spaces, directories, mutated);
	stashAssignments(ui, assignments, mutated);
	stashRoles(ui, roles, mutated);
	stashPolicies(ui, policies, mutated);
	mutated.end('CreateCommunity');
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
	await evictCommunity(ui, community_id);
	return result;
};

export const InviteToCommunity: Mutations['InviteToCommunity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;

	const {assignment, persona} = result.value;
	const mutated = new Mutated('InviteToCommunity');
	stashPersonas(ui, [persona], mutated);
	stashAssignments(ui, [assignment], mutated);
	mutated.end('InviteToCommunity');

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
	await evictAssignments(ui, assignmentsToEvict);

	return result;
};
