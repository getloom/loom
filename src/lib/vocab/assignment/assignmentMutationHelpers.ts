import type {WritableUi} from '$lib/ui/ui';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {evictPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {evictCommunity} from '$lib/vocab/community/communityMutationHelpers';
import {Mutated} from '$lib/util/Mutated';

export const stashAssignments = (
	ui: WritableUi,
	$assignmentsToStash: Assignment[],
	mutated = new Mutated('stashAssignments'),
	replace = false,
): void => {
	const {assignments, assignmentById} = ui;
	const $assignments = assignments.get().value;

	if (replace) {
		// TODO do we need to evict the current assignments? or should upstream usage handle that?
		assignmentById.clear();
		$assignments.clear();
		mutated.add(assignments);
	}

	for (const assignment of $assignmentsToStash) {
		if (assignmentById.has(assignment.assignment_id)) {
			continue; // assignments are immutable, so no need to update them
		}
		assignmentById.set(assignment.assignment_id, assignment);
		$assignments.add(assignment);
		mutated.add(assignments);
	}

	mutated.end('stashAssignments');
};

export const evictAssignments = async (
	ui: WritableUi,
	assignmentsToEvict: Assignment[],
	mutated = new Mutated('evictAssignments'),
): Promise<void> => {
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
					await evictCommunity(ui, community_id); // eslint-disable-line no-await-in-loop
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
						await evictPersona(ui, persona, mutated); // eslint-disable-line no-await-in-loop
					}
				}
			}
		}
	}
	mutated.add(assignments);

	mutated.end('evictAssignments');
};
