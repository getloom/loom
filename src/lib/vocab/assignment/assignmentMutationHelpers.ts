import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {Persona} from '$lib/vocab/persona/persona';
import {evictPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {Mutated} from '$lib/util/Mutated';

export const stashAssignments = (
	ui: WritableUi,
	$assignments: Assignment[],
	mutated = new Mutated('stashAssignments'),
): void => {
	const {assignments} = ui;

	const $ms = assignments.get().value;
	for (const $m of $assignments) {
		// TODO speed this up after adding the `assignment_id` field
		if (!$ms.find((m) => $m.assignment_id === m.get().assignment_id)) {
			$ms.push(writable($m));
			mutated.add(assignments);
		}
	}

	mutated.end('stashAssignments');
};

export const evictAssignments = (
	ui: WritableUi,
	assignmentsToEvict: Array<Writable<Assignment>>,
	mutated = new Mutated('evictAssignments'),
): void => {
	const {assignments, personaById} = ui;

	const assignmentsToEvictSet = new Set(assignmentsToEvict);

	const personasToRemove: Set<Writable<Persona>> = new Set();

	// TODO refactor to batch after changing the type of `assignments` from an array to a set
	const $assignments = assignments.get().value;
	assignments.swap(
		$assignments.filter((assignment) => {
			if (!assignmentsToEvictSet.has(assignment)) return true;
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
