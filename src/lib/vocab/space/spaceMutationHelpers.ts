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
import {Mutated} from '$lib/util/Mutated';

export const stashSpaces = (
	ui: WritableUi,
	$spacesToStash: Space[],
	$directoriesToStash?: Entity[],
	mutated = new Mutated('stashSpaces'),
	replace = false,
): void => {
	const {spaceById, spaces, spaceIdSelectionByCommunityId, spaceSelection, communityById} = ui;
	const selectedSpace = spaceSelection.get();
	const $spaceIdSelectionByCommunityId = spaceIdSelectionByCommunityId.get().value;

	if (replace) {
		spaceById.clear();
		spaces.get().value.length = 0;
		mutated.add(spaces);
	}

	for (const $space of $spacesToStash) {
		let space = spaceById.get($space.space_id);
		if (space) {
			// Update the existing space store.
			// If `space.url` changed and the space is selected, navigate to it.
			const prevUrl = space.get().url;
			space.set($space);
			if (space === selectedSpace && $space.url !== prevUrl) {
				void goto(
					toCommunityUrl(
						communityById.get($space.community_id)!.get().name,
						$space.url,
						get(page).url.search,
					),
					{replaceState: true},
				);
			}
		} else {
			// Insert the space. We don't need to handle navigation in this case.
			space = writable($space);
			spaceById.set($space.space_id, space);
			spaces.get().value.push(space);
			mutated.add(spaces);

			// Set the community's space selection if needed.
			if (!$spaceIdSelectionByCommunityId.get($space.community_id)) {
				$spaceIdSelectionByCommunityId.set($space.community_id, $space.space_id);
				mutated.add(spaceIdSelectionByCommunityId);
			}
		}
	}

	// TODO if the `mutated` pattern is added to `stashEntities`,
	// probably forward `mutated` here so everything is batched below
	if ($directoriesToStash) stashEntities(ui, $directoriesToStash);

	mutated.end('stashSpaces');
};

export const evictSpaces = async (
	ui: WritableUi,
	spacesToEvict: Array<Writable<Space>>,
): Promise<void> => {
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
				// eslint-disable-next-line no-await-in-loop
				await goto(toCommunityUrl(community.get().name, null, get(page).url.search), {
					replaceState: true,
				});
			} else {
				//TODO lookup space by community_id+url (see this comment in multiple places)
				const homeSpace = spacesByCommunityId
					.get()
					.get(community_id)!
					.find((s) => isHomeSpace(s.get()))!;
				spaceIdSelectionByCommunityId.mutate(($s) => {
					$s.set(community_id, homeSpace.get().space_id);
				});
			}
		}

		spaceById.delete(space_id);
	}

	spaces.swap(spaces.get().value.filter((s) => !spacesToEvict.includes(s)));

	evictEntities(
		ui,
		spacesToEvict.map((s) => s.get().directory_id),
	);
};
