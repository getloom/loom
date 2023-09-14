import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
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
import {isDirectory} from '$lib/vocab/entity/entityHelpers';
import type {AfterMutation} from '$lib/util/mutation';

export const stashEntities = (
	ui: WritableUi,
	afterMutation: AfterMutation,
	$entities: Entity[],
): void => {
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
		if (isDirectory($entity)) {
			// TODO maybe invert this and listen for `'stashed_entities'` instead of calling this helper directly?
			afterMutation(() => updateDirectoryFreshness(ui, $entity as Directory));
		}
	}

	afterMutation(() => ui.events.emit('stashed_entities', stashed));
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
	{tiesByDestId, tiesBySourceId, tieById}: WritableUi,
	$ties: Tie[],
): void => {
	for (const $tie of $ties) {
		// Ties are immutable, so if they're already in the system,
		// we can safely assume they're fully stashed.
		const {tie_id} = $tie;
		if (tieById.has(tie_id)) continue;
		tieById.set(tie_id, $tie);

		const {source_id, dest_id} = $tie;
		const sourceTies = lookupTies(tiesByDestId, dest_id);
		if (!sourceTies.get().value.has($tie)) {
			sourceTies.mutate((s) => s.add($tie));
		}

		const destTies = lookupTies(tiesBySourceId, source_id);
		if (!destTies.get().value.has($tie)) {
			destTies.mutate((d) => d.add($tie));
		}
	}
};

export const evictTie = (
	{tiesByDestId, tiesBySourceId, tieById}: WritableUi,
	tie_id: TieId,
): void => {
	const $tie = tieById.get(tie_id);
	if (!$tie) return;
	tieById.delete(tie_id);

	const {dest_id, source_id} = $tie;

	const sourceTies = tiesByDestId.get(dest_id);
	if (sourceTies) {
		sourceTies.mutate((s) => {
			s.delete($tie);
			if (s.size === 0) {
				tiesByDestId.delete(dest_id);
			}
		});
	}

	const destTies = tiesBySourceId.get(source_id);
	if (destTies) {
		destTies.mutate((d) => {
			d.delete($tie);
			if (d.size === 0) {
				tiesBySourceId.delete(source_id);
			}
		});
	}
};

// TODO delete orphaned entities
export const evictEntities = (ui: WritableUi, entityIds: EntityId[]): void => {
	const {entityById, tieById, freshnessByDirectoryId, tiesByDestId, tiesBySourceId} = ui;

	for (const entity_id of entityIds) {
		entityById.delete(entity_id);
		freshnessByDirectoryId.delete(entity_id);

		// TODO the loops below should be optimizable using the cached data
		// See also the TODO below.

		// Evict ties for entity.
		const sourceTies = tiesByDestId.get(entity_id);
		if (sourceTies) {
			for (const $sourceTie of sourceTies.get().value) {
				const ties = tiesBySourceId.get($sourceTie.source_id);
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
			tiesByDestId.delete(entity_id);
		}

		const destTies = tiesBySourceId.get(entity_id);
		if (destTies) {
			for (const $destTie of destTies.get().value) {
				const ties = tiesByDestId.get($destTie.dest_id);
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
			tiesBySourceId.delete(entity_id);
		}

		// TODO instead of looping through every collection here,
		// if we had `entitiesByDestId` we could do this much more efficiently,
		// or alternatively the logic of `evictTiesForEntity`
		// could be integrated in this function instead of being extracted.
		// See also the TODO above.

		// TODO
		// if (evicted) {
		// 	afterMutation(() => ui.events.emit('evicted_entities', evicted!));
		// }
	}
};
