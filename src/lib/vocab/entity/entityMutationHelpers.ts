import {writable, mutable} from '@feltcoop/svelte-gettable-stores';
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
import {Mutated} from '$lib/util/Mutated';
import {lookupTies} from '$lib/vocab/tie/tieHelpers';

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
	{sourceTiesByDestEntityId, destTiesBySourceEntityId, queryByKey, entityById, tieById}: WritableUi,
	$ties: Tie[],
	mutated = new Mutated('stashTies'),
): void => {
	for (const $tie of $ties) {
		// Ties are immutable, so if they're already in the system,
		// we can safely assume they're fully stashed.
		const {tie_id} = $tie;
		if (tieById.has(tie_id)) continue;
		tieById.set(tie_id, $tie);

		const {source_id, dest_id} = $tie;
		const sourceTies = lookupTies(sourceTiesByDestEntityId, dest_id);
		const $sourceTies = sourceTies.get().value;
		if (!$sourceTies.has($tie)) {
			$sourceTies.add($tie);
			mutated.add(sourceTies);
		}

		const destTies = lookupTies(destTiesBySourceEntityId, source_id);
		const $destTies = destTies.get().value;
		if (!$destTies.has($tie)) {
			$destTies.add($tie);
			mutated.add(destTies);
		}

		// Update the queries.
		const entity = entityById.get(dest_id);
		if (entity) {
			const query = queryByKey.get(source_id);
			if (query) {
				const $query = query.data.get().value;
				if (!$query.has(entity)) {
					$query.add(entity);
					mutated.add(query.data);
				}
			} else {
				queryByKey.set(source_id, {
					data: mutable(new Set([entity])),
					status: writable('initial'),
				});
			}
		} else {
			// TODO what should we do here? may not be a problem depending on query patterns
			log.warn('stashing tie with unknown dest entity', dest_id);
		}
	}

	mutated.end('stashTies');
};

export const evictTie = (
	{sourceTiesByDestEntityId, destTiesBySourceEntityId, tieById}: WritableUi,
	tie_id: number,
	mutated = new Mutated('evictTie'),
): void => {
	const $tie = tieById.get(tie_id);
	if (!$tie) return;
	tieById.delete(tie_id);

	const {dest_id, source_id} = $tie;

	const sourceTies = sourceTiesByDestEntityId.get(dest_id);
	if (sourceTies) {
		sourceTies.get().value.delete($tie);
		mutated.add(sourceTies);
		if (sourceTies.get().value.size === 0) {
			sourceTiesByDestEntityId.delete(dest_id);
		}
	}

	const destTies = destTiesBySourceEntityId.get(source_id);
	if (destTies) {
		destTies.get().value.delete($tie);
		mutated.add(destTies);
		if (destTies.get().value.size === 0) {
			destTiesBySourceEntityId.delete(source_id);
		}
	}

	mutated.end('evictTie');
};

// TODO delete orphaned entities
export const evictEntities = (
	ui: WritableUi,
	entityIds: number[],
	mutated = new Mutated('evictEntities'),
): void => {
	const {
		entityById,
		tieById,
		queryByKey,
		freshnessByDirectoryId,
		sourceTiesByDestEntityId,
		destTiesBySourceEntityId,
	} = ui;

	for (const entity_id of entityIds) {
		const entity = entityById.get(entity_id)!;
		entityById.delete(entity_id);
		freshnessByDirectoryId.delete(entity_id);

		// TODO the loops below should be optimizable using the cached data
		// See also the TODO below.

		// Evict ties for entity.
		const sourceTies = sourceTiesByDestEntityId.get(entity_id);
		if (sourceTies) {
			for (const $sourceTie of sourceTies.get().value) {
				const ties = destTiesBySourceEntityId.get($sourceTie.source_id);
				if (ties) {
					const $ties = ties.get().value;
					for (const $tie of $ties) {
						if ($tie.dest_id === entity_id) {
							$ties.delete($tie);
							mutated.add(ties);
							tieById.delete($tie.tie_id);
						}
					}
				}
				tieById.delete($sourceTie.tie_id);
			}
			sourceTiesByDestEntityId.delete(entity_id);
		}

		const destTies = destTiesBySourceEntityId.get(entity_id);
		if (destTies) {
			for (const $destTie of destTies.get().value) {
				const ties = sourceTiesByDestEntityId.get($destTie.dest_id);
				if (ties) {
					const $ties = ties.get().value;
					for (const $tie of $ties) {
						if ($tie.source_id === entity_id) {
							$ties.delete($tie);
							mutated.add(ties);
							tieById.delete($tie.tie_id);
						}
					}
				}
				tieById.delete($destTie.tie_id);
			}
			destTiesBySourceEntityId.delete(entity_id);
		}

		// TODO instead of looping through every collection here,
		// if we had `entitiesByDestId` we could do this much more efficiently,
		// or alternatively the logic of `evictTiesForEntity`
		// could be integrated in this function instead of being extracted.
		// See also the TODO above.

		// Update the queries.
		for (const query of queryByKey.values()) {
			const $query = query.data.get().value;
			if ($query.has(entity)) {
				$query.delete(entity);
				mutated.add(query.data);
			}
		}
		queryByKey.delete(entity_id);
	}

	mutated.end('evictEntities');
};
