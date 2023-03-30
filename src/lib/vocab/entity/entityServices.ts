import type {ServiceByName} from '$lib/app/actionTypes';
import {
	ReadEntities,
	ReadEntitiesPaginated,
	UpdateEntity,
	CreateEntity,
	EraseEntities,
	DeleteEntities,
} from '$lib/vocab/entity/entityActions';
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
	action: ReadEntities,
	transaction: false,
	perform: async ({repos, params}) => {
		const {actor, source_id} = params;
		const {hub_id} = await repos.space.findByEntity(source_id);
		await checkHubAccess(actor, hub_id, repos);

		const ties = await repos.tie.filterBySourceId(source_id);
		//TODO stop filtering directory until we fix entity indexing by space_id
		const entityIds = toTieEntityIds(ties);
		entityIds.delete(source_id);
		const {entities} = await repos.entity.filterByIds(Array.from(entityIds));
		return {ok: true, status: 200, value: {entities, ties}};
	},
};

export const ReadEntitiesPaginatedService: ServiceByName['ReadEntitiesPaginated'] = {
	action: ReadEntitiesPaginated,
	transaction: false,
	perform: async ({repos, params}) => {
		const {actor, source_id, pageSize, pageKey} = params;
		const {hub_id} = await repos.space.findByEntity(source_id);
		await checkHubAccess(actor, hub_id, repos);

		const ties = await repos.tie.filterBySourceIdPaginated(source_id, pageSize, pageKey);
		//TODO stop filtering directory until we fix entity indexing by space_id
		const entityIds = toTieEntityIds(ties);
		entityIds.delete(source_id);
		const {entities} = await repos.entity.filterByIds(Array.from(entityIds));
		return {ok: true, status: 200, value: {entities, ties}};
	},
};

export const CreateEntityService: ServiceByName['CreateEntity'] = {
	action: CreateEntity,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, data, space_id, path} = params;

		const {hub_id} = (await repos.space.findById(space_id))!;
		await checkPolicy(permissions.CreateEntity, actor, hub_id, repos);

		const entity = await repos.entity.create(actor, data, space_id, path);

		const entities = [entity];

		const ties: Tie[] = [];
		if (params.ties) {
			for (const tieParams of params.ties) {
				const {source_id, dest_id} =
					'source_id' in tieParams
						? {source_id: tieParams.source_id, dest_id: entity.entity_id}
						: {source_id: entity.entity_id, dest_id: tieParams.dest_id};
				ties.push(await repos.tie.create(source_id, dest_id, tieParams.type || 'HasItem')); // eslint-disable-line no-await-in-loop
			}
		}

		// TODO optimize overfetching, we only want the `entity_id`
		const directories = await repos.entity.filterDirectoriesByEntity(entity.entity_id);
		// TODO optimize batch update
		for (const directory of directories) {
			entities.push(await repos.entity.update(directory.entity_id)); // eslint-disable-line no-await-in-loop
		}

		return {ok: true, status: 200, value: {entities, ties}};
	},
};

export const UpdateEntityService: ServiceByName['UpdateEntity'] = {
	action: UpdateEntity,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, entity_id, data} = params;
		await checkEntityOwnership(actor, [entity_id], repos);

		const path = scrubEntityPath(params.path);

		if (typeof path === 'string') {
			const errorMessage = checkEntityPath(path);
			if (errorMessage) return {ok: false, status: 400, message: errorMessage};
		}

		const entity = await repos.entity.update(entity_id, data, path);

		return {ok: true, status: 200, value: {entity}};
	},
};

//soft deletes a single entity, leaving behind a Tombstone entity
export const EraseEntitiesService: ServiceByName['EraseEntities'] = {
	action: EraseEntities,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, entityIds} = params;
		await checkEntityOwnership(actor, entityIds, repos);

		const entities = await repos.entity.eraseByIds(entityIds);
		return {ok: true, status: 200, value: {entities}};
	},
};

//hard deletes one to many entities, removing the records from the DB
export const DeleteEntitiesService: ServiceByName['DeleteEntities'] = {
	action: DeleteEntities,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, entityIds} = params;
		await checkEntityOwnership(actor, entityIds, repos);

		await repos.entity.deleteByIds(entityIds);

		await cleanOrphanedEntities(repos);

		return {ok: true, status: 200, value: null};
	},
};
