import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Persona} from '$lib/vocab/persona/persona';
import {evictPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {Mutated} from '$lib/util/Mutated';

export const stashMemberships = (
	ui: WritableUi,
	$memberships: Membership[],
	mutated = new Mutated('stashMembership'),
): void => {
	const {memberships} = ui;

	const $ms = memberships.get().value;
	for (const $m of $memberships) {
		// TODO speed this up after adding the `membership_id` field
		if (
			!$ms.find(
				(m) => $m.community_id === m.get().community_id && $m.persona_id === m.get().persona_id,
			)
		) {
			$ms.push(writable($m));
			mutated.add(memberships);
		}
	}

	mutated.end('stashMembership');
};

export const evictMemberships = (
	ui: WritableUi,
	membershipsToEvict: Array<Writable<Membership>>,
	mutated = new Mutated('evictMemberships'),
): void => {
	const {memberships, personaById} = ui;

	const membershipsToEvictSet = new Set(membershipsToEvict);

	const personasToRemove: Set<Writable<Persona>> = new Set();

	// TODO refactor to batch after changing the type of `memberships` from an array to a set
	const $memberships = memberships.get().value;
	memberships.swap(
		$memberships.filter((membership) => {
			if (!membershipsToEvictSet.has(membership)) return true;
			// Check if we need to delete the persona along with the membership.
			const {persona_id} = membership.get();
			if (!$memberships.some((m) => m.get().persona_id === persona_id && m !== membership)) {
				personasToRemove.add(personaById.get(persona_id)!);
			}
			return false;
		}),
	);

	evictPersonas(ui, personasToRemove, mutated);

	mutated.end('evictMemberships');
};
