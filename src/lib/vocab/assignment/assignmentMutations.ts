import type {Mutations} from '$lib/vocab/action/actionTypes.js';
import {
	evictAssignments,
	stashAssignments,
} from '$lib/vocab/assignment/assignmentMutationHelpers.js';

export const CreateAssignment: Mutations['CreateAssignment'] = async ({
	invoke,
	actions,
	mutate,
	ui,
	params,
}) => {
	const {hubById} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const {assignment} = result.value;
	const {hub_id} = assignment;

	// If there's no hub locally, we were just added to it, so query its data in full.
	if (hubById.has(hub_id)) {
		mutate(() => stashAssignments(ui, [assignment]));
	} else {
		const readHubResult = await actions.ReadHub({actor: params.actor, hub_id});
		if (!readHubResult.ok) return readHubResult;
	}

	return result;
};

export const DeleteAssignment: Mutations['DeleteAssignment'] = async ({
	params,
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const assignment = ui.assignmentById.get(params.assignment_id);
	if (assignment) {
		mutate(() => evictAssignments(ui, afterMutation, [assignment]));
	}
	return result;
};
