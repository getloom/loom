import {mutable, type Mutable} from '@feltcoop/svelte-gettable-stores';

import type {Tie} from '$lib/vocab/tie/tie';
import type {EntityId} from '$lib/vocab/entity/entity';

export const toTieEntityIds = (ties: Tie[]): Set<number> => {
	const ids = new Set<number>();
	for (const {source_id, dest_id} of ties) {
		ids.add(source_id);
		ids.add(dest_id);
	}
	return ids;
};

export const lookupTies = (
	tiesByEntityId: Map<number, Mutable<Set<Tie>>>,
	entity_id: EntityId,
): Mutable<Set<Tie>> => {
	let ties = tiesByEntityId.get(entity_id);
	if (!ties) tiesByEntityId.set(entity_id, (ties = mutable(new Set())));
	return ties;
};
