import type {AsyncStatus} from '@feltjs/util/async.js';
import {
	mutable,
	writable,
	type Mutable,
	type Readable,
	type Writable,
} from '@feltcoop/svelte-gettable-stores';

import type {Entity} from '$lib/vocab/entity/entity';
import type {Dispatch} from '$lib/app/eventTypes';
import type {Ui} from '$lib/ui/ui';

export interface Query {
	data: Mutable<Set<Writable<Entity>>>;
	status: Writable<AsyncStatus>;
	error: Writable<string | null>;
}

export interface QueryParams {
	actor: number;
	source_id: number;
}

export interface PaginatedQueryState {
	status: AsyncStatus;
	error: string | null;
	more: boolean;
}

export interface PaginatedQueryStore extends Readable<PaginatedQueryState> {
	loadMore: () => Promise<void>;
	dispose: () => void;
	entities: Mutable<Array<Readable<Entity>>>;
	// ties: Mutable<Tie[]>; // TODO probably include these
}

export interface QueryAddEntity {
	(entity: Readable<Entity>, entities: Array<Readable<Entity>>): void;
}
export interface QueryMatchEntity {
	(entity: Readable<Entity>, params: QueryParams, ui: Ui): boolean;
}

export const createPaginatedQuery = (
	ui: Ui,
	dispatch: Dispatch,
	params: QueryParams,
	addEntity: QueryAddEntity = addEntitySortedByCreated,
	matchEntity: QueryMatchEntity = matchEntityBySourceId,
): PaginatedQueryStore => {
	// TODO the key should be something like `params.actor + '__ ' + params.source_id`
	// but we currently don't handle queries per persona in the mutation layer.
	const key = params.source_id;
	const {paginatedQueryByKey} = ui;
	let query = paginatedQueryByKey.get(key);
	if (query) return query;
	query = toPaginatedQuery(ui, dispatch, params, key, addEntity, matchEntity);
	paginatedQueryByKey.set(key, query);
	return query;
};

const toPaginatedQuery = (
	ui: Ui,
	dispatch: Dispatch,
	params: QueryParams,
	key: number,
	addEntity: QueryAddEntity,
	matchEntity: QueryMatchEntity,
): PaginatedQueryStore => {
	const {subscribe, update, get} = writable<PaginatedQueryState>({
		status: 'initial',
		error: null,
		more: true,
	});

	const entities: Mutable<Array<Readable<Entity>>> = mutable([]);

	let loading: Promise<void> | null = null;

	const load = async (pageKey?: number): Promise<void> => {
		const finalParams = pageKey === undefined ? params : {...params, pageKey};
		loading = dispatch.ReadEntitiesPaginated(finalParams).then(
			(result) => {
				update(($v) => {
					const updated = {...$v};
					if (result.ok) {
						updated.status = 'success';
						// TODO Should we infer less than `pageSize` means no more?
						// Or is that a faulty assumption in rare corner cases?
						// Doing so would prevent the rare empty load, but it seems more prone to errors.
						if (result.value.entities.length === 0 && result.value.ties.length === 0) {
							updated.more = false;
						}
					} else {
						updated.status = 'failure';
						updated.error = result.message;
					}
					return updated;
				});
				loading = null;
			},
			() => {
				update(($v) => ({...$v, status: 'failure', error: 'unknown error'}));
				loading = null;
			},
		);
	};

	const loadMore = async (): Promise<void> => {
		if (loading) return loading;
		const oldestEntity = entities.get().value[0];
		return load(oldestEntity?.get().entity_id);
	};

	// Listen to app events to add entities.
	const onEntitiesAdded = (addedEntities: Array<Readable<Entity>>) => {
		let mutated = false;
		for (const entity of addedEntities) {
			if (matchEntity(entity, params, ui)) {
				addEntity(entity, entities.get().value);
				mutated = true;
			}
		}
		if (mutated) entities.mutate();
	};
	ui.events.on('stashed_entities', onEntitiesAdded);

	// TODO add `entities_evicted`

	// We don't want automatic disposal on unsubscribe,
	// because we want to keep queries alive independent of the current UI.
	const dispose = () => {
		ui.paginatedQueryByKey.delete(key);
		ui.events.off('stashed_entities', onEntitiesAdded);
		entities.mutate(($v) => ($v.length = 0)); // this is probably unnecessary
	};

	// TODO add an option to create the query without loading it immediately
	void load();

	return {subscribe, get, loadMore, dispose, entities};
};

// TODO extract the logic so it can be used with other comparisons than `created` with the latest at the end
const addEntitySortedByCreated: QueryAddEntity = (entity, entities) => {
	const {created} = entity.get();
	const maxIndex = entities.length - 1;
	let index = maxIndex;
	while (index !== -1) {
		if (entities[index].get().created > created) {
			index--;
		} else {
			break;
		}
	}
	if (index === maxIndex) {
		entities.push(entity);
	} else if (index === -1) {
		entities.unshift(entity);
	} else {
		entities.splice(index + 1, 0, entity);
	}
};

const matchEntityBySourceId: QueryMatchEntity = (entity, params, ui) => {
	const ties = ui.sourceTiesByDestEntityId.get(entity.get().entity_id)?.get().value;
	if (!ties) return false;
	for (const tie of ties) {
		if (tie.source_id === params.source_id) {
			return true;
		}
	}
	return false;
};
