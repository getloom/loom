import {removeUnordered} from '@feltcoop/felt/util/array.js';

import type {Mutations} from '$lib/app/eventTypes';
import {evictCommunity} from '$lib/vocab/community/communityMutationHelpers';
import {stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';

export const CreateAssignment: Mutations['CreateAssignment'] = async ({
	invoke,
	dispatch,
	ui,
	params,
}) => {
	const {communityById} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const {assignment: $assignment} = result.value;
	const {community_id} = $assignment;

	// If there's no community locally, we were just added to it, so query its data in full.
	if (communityById.has(community_id)) {
		stashAssignments(ui, [$assignment]);
	} else {
		const readCommunityResult = await dispatch.ReadCommunity({actor: params.actor, community_id});
		if (!readCommunityResult.ok) return readCommunityResult;
	}

	return result;
};

export const DeleteAssignment: Mutations['DeleteAssignment'] = async ({params, invoke, ui}) => {
	const {assignments, sessionPersonaIds} = ui;
	const {assignment_id} = params;

	const result = await invoke();
	if (!result.ok) return result;
	//TODO fix this with an `assignmentById` store
	const assignmentIndex = assignments
		.get()
		.value.findIndex((a) => a.get().assignment_id === assignment_id)!;
	const assignment = assignments.get().value.at(assignmentIndex);
	assignments.mutate(($assignments) => {
		removeUnordered($assignments, assignmentIndex);
	});

	const {persona_id, community_id} = assignment!.get();
	// If the deleted assignment was the session's, and there's no remaining session assignments,
	// then delete the communtity from the client.
	const $sessionPersonaIds = sessionPersonaIds.get();
	if ($sessionPersonaIds.has(persona_id)) {
		const hasOtherSessionAssignment = assignments.get().value.some((assignment) => {
			const $m = assignment.get();
			return $m.community_id === community_id && $sessionPersonaIds.has($m.persona_id);
		});
		if (!hasOtherSessionAssignment) {
			await evictCommunity(ui, community_id);
		}
	}

	return result;
};
