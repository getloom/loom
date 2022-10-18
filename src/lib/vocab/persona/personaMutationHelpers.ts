import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Persona} from '$lib/vocab/persona/persona';
import {Mutated} from '$lib/util/Mutated';

export const stashPersonas = (
	{personaById, personas, sessionPersonas, communityIdSelectionByPersonaId}: WritableUi,
	$personas: Persona[],
	mutated = new Mutated('stashPersonas'),
	replace = false,
): void => {
	if (replace) {
		personaById.clear();
		personas.get().value.length = 0;
		mutated.add(personas);
		sessionPersonas.get().value.length = 0;
		mutated.add(sessionPersonas);
	}

	for (const $persona of $personas) {
		let persona = personaById.get($persona.persona_id);
		if (persona) {
			persona.set($persona);
		} else {
			persona = writable($persona);
			personaById.set($persona.persona_id, persona);
			personas.get().value.push(persona);
			mutated.add(personas);
			if ($persona.account_id) {
				// Adding a session persona.
				sessionPersonas.get().value.push(persona);
				mutated.add(sessionPersonas);
				communityIdSelectionByPersonaId.get().value.set($persona.persona_id, $persona.community_id);
				mutated.add(communityIdSelectionByPersonaId);
			}
		}
	}
	mutated.end('stashPersonas');
};

export const deletePersonas = (
	{personas, personaById}: WritableUi,
	personasToDelete: Set<Writable<Persona>>,
): void => {
	personas.swap(personas.get().value.filter((p) => !personasToDelete.has(p)));
	for (const persona of personasToDelete) {
		personaById.delete(persona.get().persona_id);
	}
};
