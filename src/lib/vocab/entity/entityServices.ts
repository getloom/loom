import {unwrap} from '@feltjs/util';

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
import {checkEntityPath, scrubEntityPath} from '$lib/vocab/entity/entityHelpers';
import {cleanOrphanedEntities} from '$lib/vocab/entity/entityHelpers.server';
import {
	checkHubAccess,
	checkEntityOwnership,
	checkPolicy,
} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';

// TODO rename to `getEntities`? `loadEntities`?
export const ReadEntitiesService: ServiceByName['ReadEntities'] = {
	event: ReadEntities,
	transaction: false,
	perform: async ({repos, params}) => {
		const {actor, source_id} = params;
		const {hub_id} = unwrap(await repos.space.findByEntity(source_id));
		await checkHubAccess(actor, hub_id, repos);

		const ties = unwrap(await repos.tie.filterBySourceId(source_id));
		//TODO stop filtering directory until we fix entity indexing by space_id
		const entityIds = toTieEntityIds(ties);
		entityIds.delete(source_id);
		const {entities} = unwrap(await repos.entity.filterByIds(Array.from(entityIds)));
		return {ok: true, status: 200, value: {entities, ties}};
	},
};

export const ReadEntitiesPaginatedService: ServiceByName['ReadEntitiesPaginated'] = {
	event: ReadEntitiesPaginated,
	transaction: false,
	perform: async ({repos, params}) => {
		const {actor, source_id, pageSize, pageKey} = params;
		const {hub_id} = unwrap(await repos.space.findByEntity(source_id));
		await checkHubAccess(actor, hub_id, repos);

		const ties = unwrap(await repos.tie.filterBySourceIdPaginated(source_id, pageSize, pageKey));
		//TODO stop filtering directory until we fix entity indexing by space_id
		const entityIds = toTieEntityIds(ties);
		entityIds.delete(source_id);
		const {entities} = unwrap(await repos.entity.filterByIds(Array.from(entityIds)));
		return {ok: true, status: 200, value: {entities, ties}};
	},
};

export const CreateEntityService: ServiceByName['CreateEntity'] = {
	event: CreateEntity,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, data, space_id} = params;

		const {hub_id} = unwrap(await repos.space.findById(space_id))!;
		await checkPolicy(permissions.CreateEntity, actor, hub_id, repos);

		const entity = unwrap(await repos.entity.create(actor, data, space_id));

		const entities = [entity];

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

		// TODO optimize overfetching, we only want the `entity_id`
		const directories = unwrap(await repos.entity.filterDirectoriesByEntity(entity.entity_id));
		// TODO optimize batch update
		for (const directory of directories) {
			entities.push(unwrap(await repos.entity.update(directory.entity_id))); // eslint-disable-line no-await-in-loop
		}

		return {ok: true, status: 200, value: {entities, ties}};
	},
};

export const UpdateEntityService: ServiceByName['UpdateEntity'] = {
	event: UpdateEntity,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, entity_id, data} = params;
		await checkEntityOwnership(actor, [entity_id], repos);

		const path = scrubEntityPath(params.path);

		if (typeof path === 'string') {
			const errorMessage = checkEntityPath(path);
			if (errorMessage) return {ok: false, status: 400, message: errorMessage};
		}

		const entity = unwrap(await repos.entity.update(entity_id, data, path));

		return {ok: true, status: 200, value: {entity}};
	},
};

//soft deletes a single entity, leaving behind a Tombstone entity
export const EraseEntitiesService: ServiceByName['EraseEntities'] = {
	event: EraseEntities,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, entityIds} = params;
		await checkEntityOwnership(actor, entityIds, repos);

		const entities = unwrap(await repos.entity.eraseByIds(entityIds));
		return {ok: true, status: 200, value: {entities}};
	},
};

//hard deletes one to many entities, removing the records from the DB
export const DeleteEntitiesService: ServiceByName['DeleteEntities'] = {
	event: DeleteEntities,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, entityIds} = params;
		await checkEntityOwnership(actor, entityIds, repos);

		unwrap(await repos.entity.deleteByIds(entityIds));

		await cleanOrphanedEntities(repos);

		return {ok: true, status: 200, value: null};
	},
};
