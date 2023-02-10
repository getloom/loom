import type {Mutations} from '$lib/app/eventTypes';
import {evictAssignments, stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';

export const CreateAssignment: Mutations['CreateAssignment'] = async ({
	invoke,
	dispatch,
	ui,
	params,
}) => {
	const {communityById} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const {assignment} = result.value;
	const {community_id} = assignment;

	// If there's no community locally, we were just added to it, so query its data in full.
	if (communityById.has(community_id)) {
		stashAssignments(ui, [assignment]);
	} else {
		const readCommunityResult = await dispatch.ReadCommunity({actor: params.actor, community_id});
		if (!readCommunityResult.ok) return readCommunityResult;
	}

	return result;
};

export const DeleteAssignment: Mutations['DeleteAssignment'] = async ({params, invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const assignment = ui.assignmentById.get(params.assignment_id);
	if (assignment) {
		await evictAssignments(ui, [assignment]);
	}
	return result;
};
