import {writable, type Writable} from '@getloom/svelte-gettable-stores';
import {goto} from '$app/navigation';

import type {WritableUi} from '$lib/ui/ui.js';
import type {AccountActor, ClientActor} from '$lib/vocab/actor/actor.js';
import {toHubUrl, toAppSearchParams} from '$lib/util/url.js';
import type {AfterMutation} from '$lib/util/mutation.js';

export const stashActors = (
	{actorById, actors, sessionActors, hubIdSelectionByActorId}: WritableUi,
	$actorsToStash: ClientActor[],
	replace = false,
): void => {
	if (replace) {
		actorById.clear();
		actors.mutate((p) => p.clear());
		sessionActors.mutate((s) => (s.length = 0));
	}

	let mutated = false;
	let mutatedSessionActors = false;
	for (const $actor of $actorsToStash) {
		let actor = actorById.get($actor.actor_id);
		if (actor) {
			// can't use `setIfUpdated` because `updated` is private
			actor.set($actor);
		} else {
			actor = writable($actor);
			actorById.set($actor.actor_id, actor);
			actors.mutate((p) => p.add(actor!));
			mutated = true;
			if ('account_id' in $actor) {
				// Adding a session actor.
				sessionActors.get().value.push(actor as Writable<AccountActor>);
				hubIdSelectionByActorId.get().value.set($actor.actor_id, $actor.hub_id);
				mutatedSessionActors = true;
			}
		}
	}
	if (mutated) actors.mutate();
	if (mutatedSessionActors) {
		sessionActors.mutate();
		hubIdSelectionByActorId.mutate();
	}
};

export const evictActor = (
	ui: WritableUi,
	afterMutation: AfterMutation,
	actorToEvict: Writable<ClientActor>,
): void => {
	const {
		actors,
		actorById,
		actorIdSelection,
		sessionActors,
		sessionActorIndexById,
		hubIdSelectionByActorId,
	} = ui;
	const $actorToEvict = actorToEvict.get();

	actorById.delete($actorToEvict.actor_id);
	actors.mutate((p) => p.delete(actorToEvict));

	// evict session account actors
	if ('account_id' in $actorToEvict) {
		const $sessionActors = sessionActors.get().value;

		sessionActors.mutate((s) => s.splice($sessionActors.indexOf(actorToEvict as any), 1));
		hubIdSelectionByActorId.mutate((c) => c.delete($actorToEvict.actor_id));

		if ($actorToEvict.actor_id === actorIdSelection.get()) {
			const nextSelectedActor = $sessionActors[$sessionActors[0] === actorToEvict ? 1 : 0];
			const nextSelectedActorIndex = sessionActorIndexById
				.get()
				.get(nextSelectedActor.get().actor_id);
			afterMutation(() =>
				goto(
					toHubUrl(
						nextSelectedActor.get().name || '',
						null,
						toAppSearchParams(nextSelectedActorIndex),
					),
					{replaceState: true},
				),
			);
		}
	}
};
