import type {Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Persona} from '$lib/vocab/persona/persona';
import {deletePersonas} from '$lib/vocab/persona/personaMutationHelpers';

export const deleteMemberships = (
	ui: WritableUi,
	membershipsToDelete: Array<Writable<Membership>>,
): void => {
	const {memberships, personaById} = ui;

	const membershipsToDeleteSet = new Set(membershipsToDelete);

	const personasToRemove: Set<Writable<Persona>> = new Set();
	const $memberships = memberships.get().value;
	memberships.swap(
		$memberships.filter((membership) => {
			if (!membershipsToDeleteSet.has(membership)) return true;
			// Check if we need to delete the persona along with the membership.
			const {persona_id} = membership.get();
			if (!$memberships.some((m) => m.get().persona_id === persona_id && m !== membership)) {
				personasToRemove.add(personaById.get(persona_id)!);
			}
			return false;
		}),
	);

	deletePersonas(ui, personasToRemove);
};
