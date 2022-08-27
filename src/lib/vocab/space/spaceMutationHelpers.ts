import {writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import {upsertEntity} from '../entity/entityMutationHelpers';

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
