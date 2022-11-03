import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {Persona} from '$lib/vocab/persona/persona';
import {evictPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {Mutated} from '$lib/util/Mutated';

export const stashAssignments = (
	ui: WritableUi,
	$assignmentsToStash: Assignment[],
	mutated = new Mutated('stashAssignments'),
): void => {
	const {assignments, assignmentById} = ui;

	const $assignments = assignments.get().value;
	for (const $assignment of $assignmentsToStash) {
		if (assignmentById.has($assignment.assignment_id)) {
			continue; // assignments are immutable, so no need to update them
		}
		const assignment = writable($assignment);
		assignmentById.set($assignment.assignment_id, assignment);
		$assignments.push(assignment);
		mutated.add(assignments);
	}

	mutated.end('stashAssignments');
};

export const evictAssignments = (
	ui: WritableUi,
	assignmentsToEvict: Array<Writable<Assignment>>,
	mutated = new Mutated('evictAssignments'),
): void => {
	const {assignments, assignmentById, personaById} = ui;

	const assignmentsToEvictSet = new Set(assignmentsToEvict);

	const personasToRemove: Set<Writable<Persona>> = new Set();

	// TODO refactor to batch after changing the type of `assignments` from an array to a set
	const $assignments = assignments.get().value;
	assignments.swap(
		$assignments.filter((assignment) => {
			if (!assignmentsToEvictSet.has(assignment)) return true;

			assignmentById.delete(assignment.get().assignment_id);

			// Check if we need to delete the persona along with the assignment.
			const {persona_id} = assignment.get();
			if (!$assignments.some((m) => m.get().persona_id === persona_id && m !== assignment)) {
				personasToRemove.add(personaById.get(persona_id)!);
			}
			return false;
		}),
	);

	evictPersonas(ui, personasToRemove, mutated);

	mutated.end('evictAssignments');
};
