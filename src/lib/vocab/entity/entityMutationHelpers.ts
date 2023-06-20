import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {Logger} from '@feltjs/util/log.js';
import {goto} from '$app/navigation';
import {page} from '$app/stores';
import {get} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui';
import type {Entity, EntityId} from '$lib/vocab/entity/entity';
import type {Tie, TieId} from '$lib/vocab/tie/tie';
import {
	setLastSeen,
	updateLastSeen,
	upsertFreshnessByHubId,
	setFreshnessByDirectoryId,
} from '$lib/ui/uiMutationHelpers';
import {lookupTies} from '$lib/vocab/tie/tieHelpers';
import {setIfUpdated} from '$lib/util/store';
import {toHubUrl} from '$lib/util/url';
import type {Directory} from '$lib/vocab/entity/entityData';

const log = new Logger('[entityMutationHelpers]');

export const stashEntities = (ui: WritableUi, $entities: Entity[]): void => {
	const {entityById, spaceSelection, hubById} = ui;

	const $selectedSpace = spaceSelection.get()?.get();

	const stashed: Array<Writable<Entity>> = [];

	for (const $entity of $entities) {
		const {entity_id} = $entity;
		let entity = entityById.get(entity_id);
		if (entity) {
			// If `directory.path` changed and the space is selected, navigate to it.
			const prevPath = entity.get().path;
			setIfUpdated(entity, $entity);
			if ($entity.entity_id === $selectedSpace?.directory_id && $entity.path !== prevPath) {
				void goto(
					toHubUrl(
						hubById.get($selectedSpace!.hub_id)!.get().name,
						$entity.path,
						get(page).url.search,
					),
					{replaceState: true},
				);
			}
		} else {
			entityById.set(entity_id, (entity = writable($entity)));
		}
		stashed.push(entity);

		// Handle directories.
		//TODO this check is not type safe, we should fix that
		if ('directory' in $entity.data) {
			// TODO maybe invert this and listen for `'stashed_entities'` instead of calling this helper directly?
			ui.afterMutation(() => updateDirectoryFreshness(ui, $entity as Directory));
		}
	}

	ui.afterMutation(() => ui.events.emit('stashed_entities', stashed));
};

const updateDirectoryFreshness = (ui: WritableUi, $directory: Directory): void => {
	const {lastSeenByDirectoryId, freshnessByDirectoryId, entityById, spaceById, spaceSelection} = ui;
	const {entity_id} = $directory;
	//TODO this chunk of code should probably rely on the 'stashed_entities' event above
	if (!lastSeenByDirectoryId.has(entity_id)) {
		setLastSeen(ui, entity_id, ($directory.updated || $directory.created).getTime());
	}
	if (!freshnessByDirectoryId.has(entity_id)) {
		setFreshnessByDirectoryId(ui, entityById.get(entity_id)!);
	}
	upsertFreshnessByHubId(ui, spaceById.get($directory.space_id)!.get().hub_id);
	// Is the directory's space selected? If so we don't want a notification.
	if (entity_id === spaceSelection.get()?.get()?.directory_id) {
		updateLastSeen(ui, entity_id);
	}
};

// TODO possibly merge with `stashEntities` to prevent update churn
export const stashTies = (
	{sourceTiesByDestEntityId, destTiesBySourceEntityId, queryByKey, entityById, tieById}: WritableUi,
	$ties: Tie[],
): void => {
	for (const $tie of $ties) {
		// Ties are immutable, so if they're already in the system,
		// we can safely assume they're fully stashed.
		const {tie_id} = $tie;
		if (tieById.has(tie_id)) continue;
		tieById.set(tie_id, $tie);

		const {source_id, dest_id} = $tie;
		const sourceTies = lookupTies(sourceTiesByDestEntityId, dest_id);
		if (!sourceTies.get().value.has($tie)) {
			sourceTies.mutate((s) => s.add($tie));
		}

		const destTies = lookupTies(destTiesBySourceEntityId, source_id);
		if (!destTies.get().value.has($tie)) {
			destTies.mutate((d) => d.add($tie));
		}

		// Update the queries.
		const entity = entityById.get(dest_id);
		if (entity) {
			// TODO this lookup is wrong, but what's the best design here?
			// extract from mutation helpers into the query store?
			// (currently there's no query store for non-paginated queries, that's a todo)
			// the issue here is that only entities with a direct tie back to the directory
			// provided to the query get stored, not the whole entity return set
			const query = queryByKey.get(source_id);
			if (query) {
				if (!query.data.get().value.has(entity)) {
					query.data.mutate((q) => q.add(entity));
				}
			}
		} else {
			// TODO what should we do here? may not be a problem depending on query patterns
			log.warn('stashing tie with unknown dest entity', dest_id);
		}
	}
};

export const evictTie = (
	{sourceTiesByDestEntityId, destTiesBySourceEntityId, tieById}: WritableUi,
	tie_id: TieId,
): void => {
	const $tie = tieById.get(tie_id);
	if (!$tie) return;
	tieById.delete(tie_id);

	const {dest_id, source_id} = $tie;

	const sourceTies = sourceTiesByDestEntityId.get(dest_id);
	if (sourceTies) {
		sourceTies.mutate((s) => {
			s.delete($tie);
			if (s.size === 0) {
				sourceTiesByDestEntityId.delete(dest_id);
			}
		});
	}

	const destTies = destTiesBySourceEntityId.get(source_id);
	if (destTies) {
		destTies.mutate((d) => {
			d.delete($tie);
			if (d.size === 0) {
				destTiesBySourceEntityId.delete(source_id);
			}
		});
	}
};

// TODO delete orphaned entities
export const evictEntities = (ui: WritableUi, entityIds: EntityId[]): void => {
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
					let mutated = false;
					for (const $tie of $ties) {
						if ($tie.dest_id === entity_id) {
							$ties.delete($tie);
							mutated = true;
							tieById.delete($tie.tie_id);
						}
					}
					if (mutated) ties.mutate();
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
					let mutated = false;
					for (const $tie of $ties) {
						if ($tie.source_id === entity_id) {
							$ties.delete($tie);
							mutated = true;
							tieById.delete($tie.tie_id);
						}
					}
					if (mutated) ties.mutate();
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
			if (query.data.get().value.has(entity)) {
				query.data.mutate((q) => q.delete(entity));
			}
		}
		queryByKey.delete(entity_id);

		// TODO
		// if (evicted) {
		// 	ui.afterMutation(() => ui.events.emit('evicted_entities', evicted!));
		// }
	}
};
