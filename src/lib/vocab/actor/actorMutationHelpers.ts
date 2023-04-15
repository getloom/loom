import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {goto} from '$app/navigation';
import {page} from '$app/stores';
import {get} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui';
import type {AccountActor, ClientActor} from '$lib/vocab/actor/actor';
import {toHubUrl, toSearchParams} from '$lib/ui/url';

export const stashActors = (
	{personaById, personas, sessionActors, hubIdSelectionByActorId}: WritableUi,
	$actorsToStash: ClientActor[],
	replace = false,
): void => {
	if (replace) {
		personaById.clear();
		personas.mutate((p) => p.clear());
		sessionActors.mutate((s) => (s.length = 0));
	}

	let mutated = false;
	let mutatedSessionActors = false;
	for (const $actor of $actorsToStash) {
		let actor = personaById.get($actor.persona_id);
		if (actor) {
			// can't use `setIfUpdated` because `updated` is private
			actor.set($actor);
		} else {
			actor = writable($actor);
			personaById.set($actor.persona_id, actor);
			personas.mutate((p) => p.add(actor!));
			mutated = true;
			if ('account_id' in $actor) {
				// Adding a session actor.
				sessionActors.get().value.push(actor as Writable<AccountActor>);
				hubIdSelectionByActorId.get().value.set($actor.persona_id, $actor.hub_id);
				mutatedSessionActors = true;
			}
		}
	}
	if (mutated) personas.mutate();
	if (mutatedSessionActors) {
		sessionActors.mutate();
		hubIdSelectionByActorId.mutate();
	}
};

export const evictActors = (ui: WritableUi, actorsToEvict: Set<Writable<ClientActor>>): void => {
	for (const actor of actorsToEvict) {
		evictActor(ui, actor);
	}
};

export const evictActor = (ui: WritableUi, actorToEvict: Writable<ClientActor>): void => {
	const {
		personas,
		personaById,
		personaIdSelection,
		sessionActors,
		sessionActorIndexById,
		hubIdSelectionByActorId,
	} = ui;
	const $actorToEvict = actorToEvict.get();

	personaById.delete($actorToEvict.persona_id);
	personas.mutate((p) => p.delete(actorToEvict));

	// evict session account actors
	if ('account_id' in $actorToEvict) {
		const $sessionActors = sessionActors.get().value;

		sessionActors.mutate((s) => s.splice($sessionActors.indexOf(actorToEvict as any), 1));
		hubIdSelectionByActorId.mutate((c) => c.delete($actorToEvict.persona_id));

		if ($actorToEvict.persona_id === personaIdSelection.get()) {
			const nextSelectedActor = $sessionActors[$sessionActors[0] === actorToEvict ? 1 : 0];
			const nextSelectedActorIndex = sessionActorIndexById
				.get()
				.get(nextSelectedActor.get().persona_id);
			ui.afterMutation(() =>
				goto(
					toHubUrl(
						nextSelectedActor.get().name || '',
						null,
						toSearchParams(get(page).url.searchParams, {
							persona: nextSelectedActorIndex ? nextSelectedActorIndex + '' : null,
						}),
					),
					{replaceState: true},
				),
			);
		}
	}
};
