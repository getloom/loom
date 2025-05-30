import type {WritableUi} from '$lib/ui/ui.js';
import type {Assignment} from '$lib/vocab/assignment/assignment.js';
import {evictActor} from '$lib/vocab/actor/actorMutationHelpers.js';
import {evictHub} from '$lib/vocab/hub/hubMutationHelpers.js';
import type {AfterMutation} from '$lib/util/mutation.js';

export const stashAssignments = (
	ui: WritableUi,
	$assignmentsToStash: Assignment[],
	replace = false,
): void => {
	const {assignments, assignmentById} = ui;

	if (replace) {
		// TODO do we need to evict the current assignments? or should upstream usage handle that?
		assignmentById.clear();
		assignments.mutate((a) => a.clear());
	}

	const $assignments = assignments.get().value;
	let mutated = false;
	for (const assignment of $assignmentsToStash) {
		if (assignmentById.has(assignment.assignment_id)) {
			continue; // assignments are immutable, so no need to update them
		}
		assignmentById.set(assignment.assignment_id, assignment);
		$assignments.add(assignment);
		mutated = true;
	}
	if (mutated) assignments.mutate();
};

export const evictAssignments = (
	ui: WritableUi,
	afterMutation: AfterMutation,
	assignmentsToEvict: Assignment[],
): void => {
	if (!assignmentsToEvict.length) return;
	const {assignments, assignmentById, actorById, sessionActorIndexById} = ui;
	const $assignments = assignments.get().value;
	const $sessionActorIndexById = sessionActorIndexById.get();

	for (const assignment of assignmentsToEvict) {
		assignmentById.delete(assignment.assignment_id);
		$assignments.delete(assignment);

		// Did the actor leave the hub?
		// Check if we need to evict any actors.
		let didActorLeaveHub = true;
		const {actor_id, hub_id} = assignment;
		// TODO could speed this up a cache of assignments by hub, see in multiple places
		for (const a of $assignments) {
			if (a.actor_id === actor_id && a.hub_id === hub_id) {
				didActorLeaveHub = false;
				break;
			}
		}
		if (didActorLeaveHub) {
			// When a session actor leaves a hub,
			// the actor is never evicted.
			// and we evict the hub unless another session actor has an assignment in it.
			// When a non-session actor leaves a hub,
			// the hub is never evicted,
			// and the actor is evicted unless it has an assignment in another hub.
			if ($sessionActorIndexById.has(actor_id)) {
				let doesHubHaveOtherSessionAssignment = false;
				for (const a of $assignments) {
					// TODO could speed this up a cache of assignments by hub, see in multiple places
					if (a.hub_id === hub_id && $sessionActorIndexById.has(a.actor_id)) {
						doesHubHaveOtherSessionAssignment = true;
						break;
					}
				}
				if (!doesHubHaveOtherSessionAssignment) {
					evictHub(ui, afterMutation, hub_id);
				}
			} else {
				let doesActorHaveOtherAssignment = false;
				// TODO could speed this up with a cache of assignments by actor
				for (const a of $assignments) {
					if (a.actor_id === actor_id) {
						doesActorHaveOtherAssignment = true;
						break;
					}
				}
				if (!doesActorHaveOtherAssignment) {
					const actor = actorById.get(actor_id);
					if (actor) {
						evictActor(ui, afterMutation, actor);
					}
				}
			}
		}
	}
	assignments.mutate();
};
