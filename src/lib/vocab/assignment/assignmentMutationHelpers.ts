import type {WritableUi} from '$lib/ui/ui';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {evictPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {evictCommunity} from '$lib/vocab/community/communityMutationHelpers';

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
	const {assignments, assignmentById, personaById, sessionPersonaIndexById} = ui;
	const $assignments = assignments.get().value;
	const $sessionPersonaIndexById = sessionPersonaIndexById.get();

	for (const assignment of assignmentsToEvict) {
		assignmentById.delete(assignment.assignment_id);
		$assignments.delete(assignment);

		// Did the persona leave the community?
		// Check if we need to evict any personas.
		let didPersonaLeaveCommunity = true;
		const {persona_id, community_id} = assignment;
		// TODO could speed this up a cache of assignments by community, see in multiple places
		for (const a of $assignments) {
			if (a.persona_id === persona_id && a.community_id === community_id) {
				didPersonaLeaveCommunity = false;
				break;
			}
		}
		if (didPersonaLeaveCommunity) {
			// When a session persona leaves a community,
			// the persona is never evicted.
			// and we evict the community unless another session persona has an assignment in it.
			// When a non-session persona leaves a community,
			// the community is never evicted,
			// and the persona is evicted unless it has an assignment in another community.
			if ($sessionPersonaIndexById.has(persona_id)) {
				let doesCommunityHaveOtherSessionAssignment = false;
				for (const a of $assignments) {
					// TODO could speed this up a cache of assignments by community, see in multiple places
					if (a.community_id === community_id && $sessionPersonaIndexById.has(a.persona_id)) {
						doesCommunityHaveOtherSessionAssignment = true;
						break;
					}
				}
				if (!doesCommunityHaveOtherSessionAssignment) {
					evictCommunity(ui, community_id);
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
