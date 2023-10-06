import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {goto} from '$app/navigation';
import {page} from '$app/stores';
import {get} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {Entity} from '$lib/vocab/entity/entity.js';
import {stashEntities, evictEntities} from '$lib/vocab/entity/entityMutationHelpers.js';
import {isHomeDirectory} from '$lib/vocab/space/spaceHelpers.js';
import {toHubUrl} from '$lib/util/url.js';
import {setIfUpdated} from '$lib/util/store.js';
import type {AfterMutation} from '$lib/util/mutation.js';

export const stashSpaces = (
	ui: WritableUi,
	afterMutation: AfterMutation,
	$spacesToStash: Space[],
	$directoriesToStash?: Entity[],
	replace = false,
): void => {
	const {spaceById, spaces, spaceIdSelectionByHubId} = ui;

	if (replace) {
		spaceById.clear();
		spaces.mutate((s) => s.clear());
	}

	if ($directoriesToStash) {
		stashEntities(ui, afterMutation, $directoriesToStash);
	}

	for (const $space of $spacesToStash) {
		let space = spaceById.get($space.space_id);
		if (space) {
			// Update the existing space store.
			setIfUpdated(space, $space);
		} else {
			// Insert the space. We don't need to handle navigation in this case.
			space = writable($space);
			spaceById.set($space.space_id, space);
			spaces.mutate((s) => s.add(space!));

			// Set the hub's space selection if needed.
			if (!spaceIdSelectionByHubId.get().value.get($space.hub_id)) {
				spaceIdSelectionByHubId.mutate((s) => s.set($space.hub_id, $space.space_id));
			}
		}
	}
};

export const evictSpaces = (
	ui: WritableUi,
	afterMutation: AfterMutation,
	spacesToEvict: Array<Writable<Space>>,
): void => {
	const {
		hubById,
		spaceIdSelectionByHubId,
		spacesByHubId,
		spaceById,
		spaces,
		hubSelection,
		entityById,
	} = ui;

	for (const space of spacesToEvict) {
		const {space_id, hub_id} = space.get();
		// If the deleted space is selected, select the home space as a fallback.
		if (space_id === spaceIdSelectionByHubId.get().value.get(hub_id)) {
			const hub = hubById.get(hub_id)!;
			if (hub === hubSelection.get()) {
				afterMutation(() =>
					goto(toHubUrl(hub.get().name, null, get(page).url.search), {
						replaceState: true,
					}),
				);
			} else {
				//TODO lookup space by hub_id+path (see this comment in multiple places)
				const homeSpace = spacesByHubId
					.get()
					.get(hub_id)!
					.find((s) => isHomeDirectory(entityById.get(s.get().directory_id)!.get()))!;
				spaceIdSelectionByHubId.mutate((s) => s.set(hub_id, homeSpace.get().space_id));
			}
		}

		spaceById.delete(space_id);
	}

	spaces.mutate((s) => {
		for (const space of spacesToEvict) {
			s.delete(space);
		}
	});

	evictEntities(
		ui,
		spacesToEvict.map((s) => s.get().directory_id),
	);
};
