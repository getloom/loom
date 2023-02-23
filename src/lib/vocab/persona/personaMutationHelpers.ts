import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {goto} from '$app/navigation';
import {page} from '$app/stores';
import {get} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui';
import type {AccountPersona, ClientPersona} from '$lib/vocab/persona/persona';
import {toCommunityUrl, toSearchParams} from '$lib/ui/url';

export const stashPersonas = (
	{personaById, personas, sessionPersonas, communityIdSelectionByPersonaId}: WritableUi,
	$personasToStash: ClientPersona[],
	replace = false,
): void => {
	if (replace) {
		personaById.clear();
		personas.mutate((p) => p.clear());
		sessionPersonas.mutate((s) => (s.length = 0));
	}

	let mutated = false;
	let mutatedSessionPersonas = false;
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
				sessionPersonas.get().value.push(persona as Writable<AccountPersona>);
				communityIdSelectionByPersonaId.get().value.set($persona.persona_id, $persona.community_id);
				mutatedSessionPersonas = true;
			}
		}
	}
	if (mutated) personas.mutate();
	if (mutatedSessionPersonas) {
		sessionPersonas.mutate();
		communityIdSelectionByPersonaId.mutate();
	}
};

export const evictPersonas = (
	ui: WritableUi,
	personasToEvict: Set<Writable<ClientPersona>>,
): void => {
	for (const persona of personasToEvict) {
		evictPersona(ui, persona);
	}
};

export const evictPersona = (ui: WritableUi, personaToEvict: Writable<ClientPersona>): void => {
	const {
		personas,
		personaById,
		personaIdSelection,
		sessionPersonas,
		sessionPersonaIndexById,
		communityIdSelectionByPersonaId,
	} = ui;
	const $personaToEvict = personaToEvict.get();

	personaById.delete($personaToEvict.persona_id);
	personas.mutate((p) => p.delete(personaToEvict));

	// evict session account personas
	if ('account_id' in $personaToEvict) {
		const $sessionPersonas = sessionPersonas.get().value;

		sessionPersonas.mutate((s) => s.splice($sessionPersonas.indexOf(personaToEvict as any), 1));
		communityIdSelectionByPersonaId.mutate((c) => c.delete($personaToEvict.persona_id));

		if ($personaToEvict.persona_id === personaIdSelection.get()) {
			const nextSelectedPersona = $sessionPersonas[$sessionPersonas[0] === personaToEvict ? 1 : 0];
			const nextSelectedPersonaIndex = sessionPersonaIndexById
				.get()
				.get(nextSelectedPersona.get().persona_id);
			ui.addMutationEffect(() =>
				goto(
					toCommunityUrl(
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
