import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Persona} from '$lib/vocab/persona/persona';

export const upsertPersonas = (
	{personaById, personas, sessionPersonas, communityIdSelectionByPersonaId}: WritableUi,
	$personas: Persona[],
): void => {
	let addedPersonas: Array<Writable<Persona>> | null = null;
	let addedSessionPersonas: Array<Writable<Persona>> | null = null;
	for (const $persona of $personas) {
		let persona = personaById.get($persona.persona_id);
		if (persona) {
			persona.set($persona);
		} else {
			persona = writable($persona);
			personaById.set($persona.persona_id, persona);
			(addedPersonas || (addedPersonas = [])).push(persona);
			if ($persona.account_id) {
				(addedSessionPersonas || (addedSessionPersonas = [])).push(persona);
			}
		}
	}
	if (addedPersonas) {
		personas.mutate(($personas) => $personas.push(...addedPersonas!));
	}
	if (addedSessionPersonas) {
		sessionPersonas.update(($sessionPersonas) => $sessionPersonas.concat(addedSessionPersonas!));
		communityIdSelectionByPersonaId.mutate(($c) => {
			for (const $sessionPersona of addedSessionPersonas!) {
				$c.set($sessionPersona.get().persona_id, $sessionPersona.get().community_id);
			}
		});
	}
};
