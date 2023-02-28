import type {Mutations} from '$lib/app/eventTypes';
import {evictAssignments, stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';

export const CreateAssignment: Mutations['CreateAssignment'] = async ({
	invoke,
	dispatch,
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
		ui.mutate(() => stashAssignments(ui, [assignment]));
	} else {
		const readHubResult = await dispatch.ReadHub({actor: params.actor, hub_id});
		if (!readHubResult.ok) return readHubResult;
	}

	return result;
};

export const DeleteAssignment: Mutations['DeleteAssignment'] = async ({params, invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const assignment = ui.assignmentById.get(params.assignment_id);
	if (assignment) {
		ui.mutate(() => evictAssignments(ui, [assignment]));
	}
	return result;
};
