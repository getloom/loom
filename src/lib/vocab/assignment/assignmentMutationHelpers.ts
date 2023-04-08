import type {WritableUi} from '$lib/ui/ui';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {evictPersona} from '$lib/vocab/actor/actorMutationHelpers';
import {evictHub} from '$lib/vocab/hub/hubMutationHelpers';

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

export const evictAssignments = (ui: WritableUi, assignmentsToEvict: Assignment[]): void => {
	if (!assignmentsToEvict.length) return;
	const {assignments, assignmentById, personaById, sessionActorIndexById} = ui;
	const $assignments = assignments.get().value;
	const $sessionActorIndexById = sessionActorIndexById.get();

	for (const assignment of assignmentsToEvict) {
		assignmentById.delete(assignment.assignment_id);
		$assignments.delete(assignment);

		// Did the persona leave the hub?
		// Check if we need to evict any personas.
		let didPersonaLeaveHub = true;
		const {persona_id, hub_id} = assignment;
		// TODO could speed this up a cache of assignments by hub, see in multiple places
		for (const a of $assignments) {
			if (a.persona_id === persona_id && a.hub_id === hub_id) {
				didPersonaLeaveHub = false;
				break;
			}
		}
		if (didPersonaLeaveHub) {
			// When a session persona leaves a hub,
			// the persona is never evicted.
			// and we evict the hub unless another session persona has an assignment in it.
			// When a non-session persona leaves a hub,
			// the hub is never evicted,
			// and the persona is evicted unless it has an assignment in another hub.
			if ($sessionActorIndexById.has(persona_id)) {
				let doesHubHaveOtherSessionAssignment = false;
				for (const a of $assignments) {
					// TODO could speed this up a cache of assignments by hub, see in multiple places
					if (a.hub_id === hub_id && $sessionActorIndexById.has(a.persona_id)) {
						doesHubHaveOtherSessionAssignment = true;
						break;
					}
				}
				if (!doesHubHaveOtherSessionAssignment) {
					evictHub(ui, hub_id);
				}
			} else {
				let doesPersonaHaveOtherAssignment = false;
				// TODO could speed this up with a cache of assignments by persona
				for (const a of $assignments) {
					if (a.persona_id === persona_id) {
						doesPersonaHaveOtherAssignment = true;
						break;
					}
				}
				if (!doesPersonaHaveOtherAssignment) {
					const persona = personaById.get(persona_id);
					if (persona) {
						evictPersona(ui, persona);
					}
				}
			}
		}
	}
	assignments.mutate();
};
