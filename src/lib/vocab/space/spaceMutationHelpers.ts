import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import {upsertEntity} from '$lib/vocab/entity/entityMutationHelpers';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {goto} from '$app/navigation';

export const upsertSpaces = (ui: WritableUi, $spaces: Space[], $directories: Entity[]): void => {
	if (!$spaces.length) return;
	const {spaceById, spaces, spaceIdSelectionByCommunityId} = ui;
	let addedSpace = false;
	for (const $space of $spaces) {
		let space = spaceById.get($space.space_id);
		if (space) {
			space.set($space);
		} else {
			addedSpace = true;
			space = writable($space);
			spaceById.set($space.space_id, space);
			spaces.get().value.push(space); // using `get()` for efficiency, see `spaces.mutate()` below
		}
	}
	const {community_id} = $spaces[0];
	if (!spaceIdSelectionByCommunityId.get().value.has(community_id)) {
		spaceIdSelectionByCommunityId.mutate(($s) => {
			$s.set(community_id, $spaces[0].space_id);
		});
	}
	for (const $directory of $directories) upsertEntity(ui, $directory); // TODO probably batch for efficiency
	if (addedSpace) spaces.mutate(); // doing this once for efficiency
};

export const evictSpaces = async (
	ui: WritableUi,
	spacesToDelete: Array<Writable<Space>>,
): Promise<void> => {
	const {
		communityById,
		spaceIdSelectionByCommunityId,
		spacesByCommunityId,
		spaceById,
		spaces,
		communitySelection,
	} = ui;

	for (const space of spacesToDelete) {
		const {space_id, community_id} = space.get();
		// If the deleted space is selected, select the home space as a fallback.
		if (space_id === spaceIdSelectionByCommunityId.get().value.get(community_id)) {
			const community = communityById.get(community_id)!;
			if (community === communitySelection.get()) {
				await goto('/' + community.get().name + location.search, {replaceState: true}); // eslint-disable-line no-await-in-loop
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

	spaces.swap(spaces.get().value.filter((s) => !spacesToDelete.includes(s)));

	// TODO do this work here instead of getting `deletedEntityIds` via the `DeleteSpace` return value
	// for (const entity_id of deletedEntityIds) {
	// 	deleteEntity(ui, entity_id);
	// }
};
