import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {goto} from '$app/navigation';
import {page} from '$app/stores';
import {get} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import {stashEntities, evictEntities} from '$lib/vocab/entity/entityMutationHelpers';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {toCommunityUrl} from '$lib/ui/url';
import {setIfUpdated} from '$lib/util/store';

export const stashSpaces = (
	ui: WritableUi,
	$spacesToStash: Space[],
	$directoriesToStash?: Entity[],
	replace = false,
): void => {
	const {spaceById, spaces, spaceIdSelectionByCommunityId, spaceSelection, communityById} = ui;
	const selectedSpace = spaceSelection.get();

	if (replace) {
		spaceById.clear();
		spaces.mutate((s) => s.clear());
	}

	for (const $space of $spacesToStash) {
		let space = spaceById.get($space.space_id);
		if (space) {
			// Update the existing space store.
			// If `space.path` changed and the space is selected, navigate to it.
			const prevUrl = space.get().path;
			setIfUpdated(space, $space);
			if (space === selectedSpace && $space.path !== prevUrl) {
				void goto(
					toCommunityUrl(
						communityById.get($space.community_id)!.get().name,
						$space.path,
						get(page).url.search,
					),
					{replaceState: true},
				);
			}
		} else {
			// Insert the space. We don't need to handle navigation in this case.
			space = writable($space);
			spaceById.set($space.space_id, space);
			spaces.mutate((s) => s.add(space!));

			// Set the community's space selection if needed.
			if (!spaceIdSelectionByCommunityId.get().value.get($space.community_id)) {
				spaceIdSelectionByCommunityId.mutate((s) => s.set($space.community_id, $space.space_id));
			}
		}
	}

	if ($directoriesToStash) {
		stashEntities(ui, $directoriesToStash);
	}
};

export const evictSpaces = (ui: WritableUi, spacesToEvict: Array<Writable<Space>>): void => {
	const {
		communityById,
		spaceIdSelectionByCommunityId,
		spacesByCommunityId,
		spaceById,
		spaces,
		communitySelection,
	} = ui;

	for (const space of spacesToEvict) {
		const {space_id, community_id} = space.get();
		// If the deleted space is selected, select the home space as a fallback.
		if (space_id === spaceIdSelectionByCommunityId.get().value.get(community_id)) {
			const community = communityById.get(community_id)!;
			if (community === communitySelection.get()) {
				ui.afterMutation(() =>
					goto(toCommunityUrl(community.get().name, null, get(page).url.search), {
						replaceState: true,
					}),
				);
			} else {
				//TODO lookup space by community_id+path (see this comment in multiple places)
				const homeSpace = spacesByCommunityId
					.get()
					.get(community_id)!
					.find((s) => isHomeSpace(s.get()))!;
				spaceIdSelectionByCommunityId.mutate((s) => s.set(community_id, homeSpace.get().space_id));
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
