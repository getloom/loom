import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {goto} from '$app/navigation';
import {page} from '$app/stores';
import {get} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui';
import type {AccountActor, ClientActor} from '$lib/vocab/actor/persona';
import {toHubUrl, toSearchParams} from '$lib/ui/url';

export const stashActors = (
	{personaById, personas, sessionActors, hubIdSelectionByPersonaId}: WritableUi,
	$personasToStash: ClientActor[],
	replace = false,
): void => {
	if (replace) {
		personaById.clear();
		personas.mutate((p) => p.clear());
		sessionActors.mutate((s) => (s.length = 0));
	}

	let mutated = false;
	let mutatedSessionActors = false;
	for (const $persona of $personasToStash) {
		let persona = personaById.get($persona.persona_id);
		if (persona) {
			// can't use `setIfUpdated` because `updated` is private
			persona.set($persona);
		} else {
			persona = writable($persona);
			personaById.set($persona.persona_id, persona);
			personas.mutate((p) => p.add(persona!));
			mutated = true;
			if ('account_id' in $persona) {
				// Adding a session persona.
				sessionActors.get().value.push(persona as Writable<AccountActor>);
				hubIdSelectionByPersonaId.get().value.set($persona.persona_id, $persona.hub_id);
				mutatedSessionActors = true;
			}
		}
	}
	if (mutated) personas.mutate();
	if (mutatedSessionActors) {
		sessionActors.mutate();
		hubIdSelectionByPersonaId.mutate();
	}
};

export const evictActors = (ui: WritableUi, personasToEvict: Set<Writable<ClientActor>>): void => {
	for (const persona of personasToEvict) {
		evictPersona(ui, persona);
	}
};

export const evictPersona = (ui: WritableUi, personaToEvict: Writable<ClientActor>): void => {
	const {
		personas,
		personaById,
		personaIdSelection,
		sessionActors,
		sessionPersonaIndexById,
		hubIdSelectionByPersonaId,
	} = ui;
	const $personaToEvict = personaToEvict.get();

	personaById.delete($personaToEvict.persona_id);
	personas.mutate((p) => p.delete(personaToEvict));

	// evict session account personas
	if ('account_id' in $personaToEvict) {
		const $sessionActors = sessionActors.get().value;

		sessionActors.mutate((s) => s.splice($sessionActors.indexOf(personaToEvict as any), 1));
		hubIdSelectionByPersonaId.mutate((c) => c.delete($personaToEvict.persona_id));

		if ($personaToEvict.persona_id === personaIdSelection.get()) {
			const nextSelectedPersona = $sessionActors[$sessionActors[0] === personaToEvict ? 1 : 0];
			const nextSelectedPersonaIndex = sessionPersonaIndexById
				.get()
				.get(nextSelectedPersona.get().persona_id);
			ui.afterMutation(() =>
				goto(
					toHubUrl(
						nextSelectedPersona.get().name || '',
						null,
						toSearchParams(get(page).url.searchParams, {
							persona: nextSelectedPersonaIndex ? nextSelectedPersonaIndex + '' : null,
						}),
					),
					{replaceState: true},
				),
			);
		}
	}
};
