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
	const {community_id, persona_id} = params;

	const result = await invoke();
	if (!result.ok) return result;
	assignments.mutate(($assignments) => {
		const index = $assignments.findIndex((assignment) => {
			const $m = assignment.get();
			return $m.persona_id === persona_id && $m.community_id === community_id;
		});
		removeUnordered($assignments, index);
	});

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
