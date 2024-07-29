import type {Async_Status} from '@ryanatkn/belt/async.js';
import {
	mutable,
	writable,
	type Mutable,
	type Readable,
	type Writable,
} from '@getloom/svelte-gettable-stores';

import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
import type {Actions} from '$lib/vocab/action/actionTypes.js';
import type {Ui} from '$lib/ui/ui.js';
import type {ActorId} from '$lib/vocab/actor/actor.js';

export interface Query {
	data: Mutable<Set<Writable<Entity>>>;
	status: Writable<Async_Status>;
	error: Writable<string | null>;
}

export interface QueryParams {
	actor: ActorId;
	// TODO array of these? `query: [{source_id: s}, {path: '/thread'}]`
	source_id: EntityId;
	path?: string;
	related?: 'dest' | 'source' | 'both';
	orderBy?: 'newest' | 'oldest';
}

export interface QueryState {
	status: Async_Status;
	error: string | null;
	more: boolean;
}

export interface QueryStore extends Readable<QueryState> {
	loadMore: () => Promise<void>;
	dispose: () => void;
	params: QueryParams;
	entities: Mutable<Array<Readable<Entity>>>;
	// ties: Mutable<Tie[]>; // TODO probably include these
}

export interface QueryAddEntity {
	(entity: Readable<Entity>, entities: Array<Readable<Entity>>): void;
}
export interface QueryMatchEntity {
	(entity: Readable<Entity>, params: QueryParams, ui: Ui): boolean;
}

export interface QueryRemoveEntity {
	(entity: Readable<Entity>, entities: Array<Readable<Entity>>): void;
}

export const createQuery = (
	ui: Ui,
	actions: Actions,
	params: QueryParams,
	reversed = false,
	addEntity: QueryAddEntity = reversed
		? addEntitySortedByCreatedReversed
		: addEntitySortedByCreated,
	matchEntity: QueryMatchEntity = matchEntityBySourceId,
	removeEntity: QueryRemoveEntity = removeEntityById,
): QueryStore => {
	// TODO the key should be something like `params.actor + '__ ' + params.source_id`
	// but we currently don't handle queries per actor in the mutation layer.
	const key = params.source_id;
	const {queryByKey} = ui;
	let query = queryByKey.get(key);
	if (query) return query;
	query = toPaginatedQuery(
		ui,
		actions,
		params,
		key,
		reversed,
		addEntity,
		matchEntity,
		removeEntity,
	);
	queryByKey.set(key, query);
	return query;
};

const toPaginatedQuery = (
	ui: Ui,
	actions: Actions,
	params: QueryParams,
	key: number,
	reversed: boolean,
	addEntity: QueryAddEntity,
	matchEntity: QueryMatchEntity,
	removeEntity: QueryRemoveEntity,
): QueryStore => {
	const orderBy = params.orderBy ?? 'newest';
	const {subscribe, update, get} = writable<QueryState>({
		status: 'initial',
		error: null,
		more: true,
	});

	const entities: Mutable<Array<Readable<Entity>>> = mutable([]);

	let loading: Promise<void> | null = null;

	const load = async (pageKey?: number): Promise<void> => {
		const finalParams = pageKey === undefined ? params : {...params, pageKey};
		loading = actions.ReadEntities(finalParams).then(
			(result) => {
				update(($v) => {
					const updated = {...$v};
					if (result.ok) {
						updated.status = 'success';
						updated.more = result.value.more;
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
		const $entities = entities.get().value;
		const oldest =
			orderBy === 'newest'
				? reversed
					? $entities[$entities.length - 1]
					: $entities[0]
				: reversed
					? $entities[0]
					: $entities[$entities.length - 1];
		return load(oldest?.get().entity_id);
	};

	// Listen to app events to add entities.
	const onEntitiesAdded = (addedEntities: Array<Readable<Entity>>) => {
		let mutated = false;
		const add = (entity: Readable<Entity>) => {
			if (matchEntity(entity, params, ui)) {
				// TODO HACK should this be a set? and then have sorted array projections?
				if (entities.get().value.includes(entity)) {
					return;
				}
				addEntity(entity, entities.get().value);
				mutated = true;
			}
		};
		if (reversed) {
			for (let i = addedEntities.length - 1; i >= 0; i--) {
				add(addedEntities[i]);
			}
		} else {
			for (const entity of addedEntities) {
				add(entity);
			}
		}

		if (mutated) entities.mutate();
	};
	ui.events.on('stashed_entities', onEntitiesAdded);

	// Listen to app events to evict entities
	const onEntitiesEvicted = (evictedEntities: Array<Readable<Entity>>) => {		
		let mutated = false;
		const remove = (entity: Readable<Entity>) => {			
			if (entities.get().value.includes(entity)) {
				removeEntity(entity, entities.get().value);
				mutated = true;
			} else {
				return;
			}
		};
		for (const entity of evictedEntities) {
			remove(entity);
		}
		if (mutated) entities.mutate();
	};
	ui.events.on('evicted_entities', onEntitiesEvicted);

	// We don't want automatic disposal on unsubscribe,
	// because we want to keep queries alive independent of the current UI.
	const dispose = () => {
		ui.queryByKey.delete(key);
		ui.events.off('stashed_entities', onEntitiesAdded);
		entities.mutate(($v) => ($v.length = 0)); // this is probably unnecessary
	};

	// TODO add an option to create the query without loading it immediately
	void load();

	return {subscribe, get, loadMore, dispose, params, entities};
};

export interface CompareEntities {
	(a: Entity, b: Entity): boolean;
}

export const toQueryAddEntity =
	(reversed: boolean, compare: CompareEntities): QueryAddEntity =>
	(entity, entities) => {
		const $entity = entity.get();
		const maxIndex = entities.length - 1;
		let index: number;
		if (reversed) {
			// insert starting from the beginning
			index = 0;
			while (index <= maxIndex) {
				if (!compare(entities[index].get(), $entity)) {
					index++;
					// console.log(`index`, index);
				} else {
					break;
				}
			}
		} else {
			// insert starting from the end
			index = maxIndex;
			while (index !== -1) {
				if (compare(entities[index].get(), $entity)) {
					index--;
					// console.log(`index`, index);
				} else {
					break;
				}
			}
		}
		// console.log(`final index`, index);
		if (index > maxIndex) {
			entities.push(entity);
		} else if (index <= 0) {
			entities.unshift(entity);
		} else {
			entities.splice(index + 1, 0, entity);
		}
	};

export const addEntitySortedByCreated = toQueryAddEntity(false, (a, b) => a.created > b.created);
export const addEntitySortedByCreatedReversed = toQueryAddEntity(
	true,
	(a, b) => a.created < b.created,
);

const matchEntityBySourceId: QueryMatchEntity = (entity, params, ui) => {
	const ties = ui.tiesByDestId.get(entity.get().entity_id)?.get().value;
	if (!ties) return false;
	const {source_id} = params;
	for (const tie of ties) {
		if (tie.source_id === source_id) {
			return true;
		}
	}
	return false;
};

const removeEntityById: QueryRemoveEntity = (entity, entities) => {
	const index = entities.findIndex((e) => e === entity);
	entities.splice(index, 1);
};
