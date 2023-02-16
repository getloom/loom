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
	//TODO probably delete this
	addEntity: AddQueryResultItem;
	dispose: () => void;
	entities: Mutable<Array<Readable<Entity>>>;
	// ties: Mutable<Tie[]>; // TODO probably include these
}

export interface AddQueryResultItem {
	(entities: Array<Readable<Entity>>, entity: Readable<Entity>): void;
}

export const createPaginatedQuery = (
	ui: Ui,
	dispatch: Dispatch,
	params: QueryParams,
	addEntity: AddQueryResultItem = addEntitySortedByCreated,
): PaginatedQueryStore => {
	// TODO the key should be something like `params.actor + '__ ' + params.source_id`
	// but we currently don't handle queries per persona in the mutation layer.
	// See the "query key todo" in multiple places.
	const key = params.source_id;
	const {paginatedQueryByKey} = ui;
	let query = paginatedQueryByKey.get(key);
	if (query) return query;
	query = toPaginatedQuery(ui, dispatch, params, key, addEntity);
	paginatedQueryByKey.set(key, query);
	return query;
};

const toPaginatedQuery = (
	ui: Ui,
	dispatch: Dispatch,
	params: QueryParams,
	key: number,
	addEntity: AddQueryResultItem,
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
						entities.mutate(($entities) => {
							const {entityById} = ui;
							for (const entity of result.value.entities) {
								addEntity($entities, entityById.get(entity.entity_id)!);
							}
						});
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

	// We don't want automatic disposal on unsubscribe,
	// because we want to keep queries alive independent of the current UI.
	const dispose = () => {
		ui.paginatedQueryByKey.delete(key);
		entities.mutate(($v) => ($v.length = 0));
	};

	// TODO add an option to create the query without loading it immediately
	void load();

	return {subscribe, get, loadMore, dispose, addEntity, entities};
};

// TODO extract the logic so it can be used with other comparisons
const addEntitySortedByCreated: AddQueryResultItem = (entities, entity) => {
	// TODO this early return is a hack
	// See the "query key todo" in multiple places.
	if (entities.includes(entity)) return;

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
