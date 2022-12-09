import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {goto} from '$app/navigation';
import {page} from '$app/stores';
import {get} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui';
import type {AccountPersona, ClientPersona} from '$lib/vocab/persona/persona';
import {Mutated} from '$lib/util/Mutated';
import {toCommunityUrl, toSearchParams} from '$lib/ui/url';

export const stashPersonas = (
	{personaById, personas, sessionPersonas, communityIdSelectionByPersonaId}: WritableUi,
	$personas: ClientPersona[],
	mutated = new Mutated('stashPersonas'),
	replace = false,
): void => {
	if (replace) {
		personaById.clear();
		personas.get().value.clear();
		mutated.add(personas);
		sessionPersonas.get().value.length = 0;
		mutated.add(sessionPersonas);
	}

	for (const $persona of $personas) {
		let persona = personaById.get($persona.persona_id);
		if (persona) {
			// can't use `setIfUpdated` because `updated` is private
			persona.set($persona);
		} else {
			persona = writable($persona);
			personaById.set($persona.persona_id, persona);
			personas.get().value.add(persona);
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

export const evictPersonas = async (
	ui: WritableUi,
	personasToEvict: Set<Writable<ClientPersona>>,
	mutated = new Mutated('evictPersonas'),
): Promise<void> => {
	await Promise.all(Array.from(personasToEvict).map((p) => evictPersona(ui, p, mutated)));
	mutated.end('evictPersonas');
};

export const evictPersona = async (
	{
		personas,
		personaById,
		personaIdSelection,
		sessionPersonas,
		sessionPersonaIndexById,
		communityIdSelectionByPersonaId,
	}: WritableUi,
	personaToEvict: Writable<ClientPersona>,
	mutated = new Mutated('evictPersona'),
): Promise<void> => {
	const $personaToEvict = personaToEvict.get();

	personaById.delete($personaToEvict.persona_id);
	personas.get().value.delete(personaToEvict);
	mutated.add(personas);

	// evict session account personas
	if ('account_id' in $personaToEvict) {
		const $sessionPersonas = sessionPersonas.get().value;

		$sessionPersonas.splice($sessionPersonas.indexOf(personaToEvict as any), 1);
		mutated.add(sessionPersonas);
		communityIdSelectionByPersonaId.get().value.delete($personaToEvict.persona_id);
		mutated.add(communityIdSelectionByPersonaId);

		if ($personaToEvict.persona_id === personaIdSelection.get()) {
			const nextSelectedPersona = $sessionPersonas[$sessionPersonas[0] === personaToEvict ? 1 : 0];
			const nextSelectedPersonaIndex = sessionPersonaIndexById
				.get()
				.get(nextSelectedPersona.get().persona_id);
			await goto(
				toCommunityUrl(
					nextSelectedPersona.get().name || '',
					null,
					toSearchParams(get(page).url.searchParams, {
						persona: nextSelectedPersonaIndex ? nextSelectedPersonaIndex + '' : null,
					}),
				),
				{replaceState: true},
			);
		}
	}

	mutated.end('evictPersona');
};
