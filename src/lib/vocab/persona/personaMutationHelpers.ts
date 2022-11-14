import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {removeUnordered} from '@feltcoop/felt/util/array.js';

import type {WritableUi} from '$lib/ui/ui';
import type {AccountPersona, ClientPersona} from '$lib/vocab/persona/persona';
import {Mutated} from '$lib/util/Mutated';

export const stashPersonas = (
	{personaById, personas, sessionPersonas, communityIdSelectionByPersonaId}: WritableUi,
	$personas: ClientPersona[],
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
			if ('account_id' in $persona) {
				// Adding a session persona.
				sessionPersonas.get().value.push(persona as Writable<AccountPersona>);
				mutated.add(sessionPersonas);
				communityIdSelectionByPersonaId.get().value.set($persona.persona_id, $persona.community_id);
				mutated.add(communityIdSelectionByPersonaId);
			}
		}
	}
	mutated.end('stashPersonas');
};

export const evictPersonas = (
	ui: WritableUi,
	personasToEvict: Set<Writable<ClientPersona>>,
	mutated = new Mutated('evictPersonas'),
): void => {
	for (const p of personasToEvict) {
		evictPersona(ui, p, mutated);
	}
	mutated.end('evictPersonas');
};

export const evictPersona = (
	{personas, personaById}: WritableUi,
	personaToEvict: Writable<ClientPersona>,
	mutated = new Mutated('evictPersona'),
): void => {
	removeUnordered(personas.get().value, personas.get().value.indexOf(personaToEvict));
	mutated.add(personas);
	personaById.delete(personaToEvict.get().persona_id);
	mutated.end('evictPersona');
};
