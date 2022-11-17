import {unwrap} from '@feltcoop/util';

import type {ServiceByName} from '$lib/app/eventTypes';
import {
	ReadEntities,
	ReadEntitiesPaginated,
	UpdateEntity,
	CreateEntity,
	EraseEntities,
	DeleteEntities,
} from '$lib/vocab/entity/entityEvents';
import {toTieEntityIds} from '$lib/vocab/tie/tieHelpers';
import type {Tie} from '$lib/vocab/tie/tie';

// TODO rename to `getEntities`? `loadEntities`?
export const ReadEntitiesService: ServiceByName['ReadEntities'] = {
	event: ReadEntities,
	perform: async ({repos, params}) => {
		const ties = unwrap(await repos.tie.filterBySourceId(params.source_id));
		//TODO stop filtering directory until we fix entity indexing by space_id
		const entityIds = toTieEntityIds(ties);
		entityIds.delete(params.source_id);
		const {entities} = unwrap(await repos.entity.filterByIds(Array.from(entityIds)));
		return {ok: true, status: 200, value: {entities, ties}};
	},
};

export const ReadEntitiesPaginatedService: ServiceByName['ReadEntitiesPaginated'] = {
	event: ReadEntitiesPaginated,
	perform: async ({repos, params}) => {
		const ties = unwrap(
			await repos.tie.filterBySourceIdPaginated(params.source_id, params.pageSize, params.pageKey),
		);
		//TODO stop filtering directory until we fix entity indexing by space_id
		const entityIds = toTieEntityIds(ties);
		entityIds.delete(params.source_id);
		const {entities} = unwrap(await repos.entity.filterByIds(Array.from(entityIds)));
		return {ok: true, status: 200, value: {entities, ties}};
	},
};

export const CreateEntityService: ServiceByName['CreateEntity'] = {
	event: CreateEntity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const entity = unwrap(await repos.entity.create(params.actor, params.data));

			const ties: Tie[] = [];
			if (params.ties) {
				for (const tieParams of params.ties) {
					const {source_id, dest_id} =
						'source_id' in tieParams
							? {source_id: tieParams.source_id, dest_id: entity.entity_id}
							: {source_id: entity.entity_id, dest_id: tieParams.dest_id};
					ties.push(
						unwrap(
							await repos.tie.create(source_id, dest_id, tieParams.type || 'HasItem'), // eslint-disable-line no-await-in-loop
						),
					);
				}
			}

			return {ok: true, status: 200, value: {entity, ties}};
		}),
};

export const UpdateEntityService: ServiceByName['UpdateEntity'] = {
	event: UpdateEntity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const entity = unwrap(await repos.entity.updateEntityData(params.entity_id, params.data));
			return {ok: true, status: 200, value: {entity}};
		}),
};

//soft deletes a single entity, leaving behind a Tombstone entity
export const EraseEntitiesService: ServiceByName['EraseEntities'] = {
	event: EraseEntities,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const entities = unwrap(await repos.entity.eraseByIds(params.entityIds));
			return {ok: true, status: 200, value: {entities}};
		}),
};

//hard deletes one to many entities, removing the records from the DB
export const DeleteEntitiesService: ServiceByName['DeleteEntities'] = {
	event: DeleteEntities,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			unwrap(await repos.entity.deleteByIds(params.entityIds));

			// Deleting one entity may orphan others, so loop until there are no more orphans.
			// TODO optimize this into a single SQL statement (recursive?)
			while (true) {
				const orphans = unwrap(await repos.entity.findOrphanedEntities()); // eslint-disable-line no-await-in-loop
				if (orphans.length === 0) {
					break;
				}
				unwrap(await repos.entity.deleteByIds(orphans)); // eslint-disable-line no-await-in-loop
			}

			return {ok: true, status: 200, value: null};
		}),
};
