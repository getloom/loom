import {writable, mutable, type Mutable} from '@feltcoop/svelte-gettable-stores';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {WritableUi} from '$lib/ui/ui';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Tie} from '$lib/vocab/tie/tie';
import {
	setLastSeen,
	updateLastSeen,
	upsertFreshnessByCommunityId,
	setFreshnessByDirectoryId,
} from '$lib/ui/uiMutationHelpers';

const log = new Logger('[entityMutationHelpers]');

export const stashEntities = (ui: WritableUi, $entities: Entity[]): void => {
	const {entityById, spaceSelection, spaceById, freshnessByDirectoryId} = ui;

	for (const $entity of $entities) {
		const {entity_id} = $entity;
		let entity = entityById.get(entity_id);
		if (entity) {
			entity.set($entity);
		} else {
			entityById.set(entity_id, (entity = writable($entity)));
		}

		// Handle directories.
		if ('space_id' in $entity.data) {
			if (!freshnessByDirectoryId.get(entity_id)) {
				setLastSeen(ui, entity_id, ($entity.updated || $entity.created).getTime());
				setFreshnessByDirectoryId(ui, entity);
			}
			upsertFreshnessByCommunityId(ui, spaceById.get($entity.data.space_id)!.get().community_id);
			// Is the directory's space selected? If so we don't want a notification.
			if (entity_id === spaceSelection.get()?.get().directory_id) {
				updateLastSeen(ui, entity_id);
			}
		}
	}
};

// TODO possibly merge with `stashEntities` to prevent update churn
export const stashTies = (
	{sourceTiesByDestEntityId, destTiesBySourceEntityId, entitiesBySourceId, entityById}: WritableUi,
	$ties: Tie[],
): void => {
	const mutated = new Set<Mutable<any>>();
	const $sourceTiesByDestEntityId = sourceTiesByDestEntityId.get().value;
	const $destTiesBySourceEntityId = destTiesBySourceEntityId.get().value;

	for (const $tie of $ties) {
		const {source_id, dest_id, type} = $tie;
		let sourceTies = $sourceTiesByDestEntityId.get(dest_id);
		if (!sourceTies) {
			sourceTies = mutable([]);
			$sourceTiesByDestEntityId.set(dest_id, sourceTies);
			mutated.add(sourceTiesByDestEntityId);
		}
		const $sourceTies = sourceTies.get().value;
		// TODO optimize lookup, maybe with a map by cached tie key
		if (
			!$sourceTies.find(
				($t) => $t.dest_id === dest_id && $t.source_id === source_id && $t.type === type,
			)
		) {
			$sourceTies.push($tie);
			mutated.add(sourceTies);
		}

		let destTies = $destTiesBySourceEntityId.get(source_id);
		if (!destTies) {
			destTies = mutable([]);
			$destTiesBySourceEntityId.set(source_id, destTies);
			mutated.add(destTiesBySourceEntityId);
		}
		const $destTies = destTies.get().value;
		// TODO optimize lookup, maybe with a map by cached tie key
		if (
			!$destTies.find(
				($t) => $t.dest_id === dest_id && $t.source_id === source_id && $t.type === type,
			)
		) {
			$destTies.push($tie);
			mutated.add(destTies);
		}

		// Update the dest entity set.
		const entity = entityById.get(dest_id);
		if (entity) {
			const destEntities = entitiesBySourceId.get(source_id);
			if (destEntities) {
				const $destEntities = destEntities.get().value;
				if (!$destEntities.has(entity)) {
					$destEntities.add(entity);
					mutated.add(destEntities);
				}
			} else {
				entitiesBySourceId.set(source_id, mutable(new Set([entity])));
			}
		} else {
			// TODO what should we do here? may not be a problem depending on query patterns
			log.warn('stashing tie with unknown dest entity', dest_id);
		}
	}

	// Batch mutations.
	for (const m of mutated) m.mutate();
};

export const evictTie = (
	{sourceTiesByDestEntityId, destTiesBySourceEntityId}: WritableUi,
	source_id: number,
	dest_id: number,
	type: string,
): void => {
	const sources = sourceTiesByDestEntityId.get().value.get(dest_id);
	if (sources) {
		sources.mutate(($sources) => {
			for (let i = $sources.length - 1; i >= 0; i--) {
				const sourceTie = $sources[i];
				if (sourceTie.source_id === source_id && sourceTie.type === type) $sources.splice(i, 1);
			}
		});
		if (sources.get().value.length === 0) {
			sourceTiesByDestEntityId.mutate(($v) => {
				$v.delete(dest_id);
			});
		}
	}

	const destinations = destTiesBySourceEntityId.get().value.get(source_id);
	if (destinations) {
		destinations.mutate(($destinations) => {
			for (let i = $destinations.length - 1; i >= 0; i--) {
				const destTie = $destinations[i];
				if (destTie.dest_id === dest_id && destTie.type === type) $destinations.splice(i, 1);
			}
		});
		if (destinations.get().value.length === 0) {
			destTiesBySourceEntityId.mutate(($v) => {
				$v.delete(source_id);
			});
		}
	}
};

// TODO delete orphaned entities
export const evictEntities = (ui: WritableUi, entityIds: number[]): void => {
	const {
		entityById,
		entitiesBySourceId,
		freshnessByDirectoryId,
		sourceTiesByDestEntityId,
		destTiesBySourceEntityId,
	} = ui;

	const $sourceTiesByDestEntityId = sourceTiesByDestEntityId.get().value;
	const $destTiesBySourceEntityId = destTiesBySourceEntityId.get().value;

	const mutated = new Set<Mutable<any>>();

	for (const entity_id of entityIds) {
		const entity = entityById.get(entity_id)!;
		entityById.delete(entity_id);
		freshnessByDirectoryId.delete(entity_id);

		// TODO the loops below should be optimizable using the cached data
		// See also the TODO below.

		// Evict ties for entity.
		const sourceTies = $sourceTiesByDestEntityId.get(entity_id);
		if (sourceTies) {
			for (const sourceTie of sourceTies.get().value) {
				const ties = $destTiesBySourceEntityId.get(sourceTie.source_id);
				if (ties) {
					const $ties = ties.get().value;
					for (let i = $ties.length - 1; i >= 0; i--) {
						if ($ties[i].dest_id === entity_id) {
							$ties.splice(i, 1);
							mutated.add(ties);
						}
					}
				}
			}
			$sourceTiesByDestEntityId.delete(entity_id);
			mutated.add(sourceTiesByDestEntityId);
		}

		const destTies = $destTiesBySourceEntityId.get(entity_id);
		if (destTies) {
			for (const destTie of destTies.get().value) {
				const ties = $sourceTiesByDestEntityId.get(destTie.dest_id);
				if (ties) {
					const $ties = ties.get().value;
					for (let i = $ties.length - 1; i >= 0; i--) {
						if ($ties[i].source_id === entity_id) {
							$ties.splice(i, 1);
							mutated.add(ties);
						}
					}
				}
			}
			$destTiesBySourceEntityId.delete(entity_id);
			mutated.add(destTiesBySourceEntityId);
		}

		// TODO instead of looping through every collection here,
		// if we had `entitiesByDestId` we could do this much more efficiently,
		// or alternatively the logic of `evictTiesForEntity`
		// could be integrated in this function instead of being extracted.
		// See also the TODO above.

		// Update the dest entity set.
		for (const destEntities of entitiesBySourceId.values()) {
			const $destEntities = destEntities.get().value;
			if ($destEntities.has(entity)) {
				$destEntities.delete(entity);
				mutated.add(destEntities);
			}
		}
		entitiesBySourceId.delete(entity_id);
	}

	// Batch mutations.
	for (const m of mutated) m.mutate();
};
