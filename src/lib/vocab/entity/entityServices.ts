import {dequal} from 'dequal';
import {Logger} from '@ryanatkn/belt/log.js';

import type {ServiceByName} from '$lib/vocab/action/actionTypes.js';
import {
	ReadEntities,
	UpdateEntities,
	CreateEntity,
	EraseEntities,
	DeleteEntities,
	ReadEntitiesById,
} from '$lib/vocab/entity/entityActions.js';
import {toTieEntityIds} from '$lib/vocab/tie/tieHelpers.js';
import type {Tie} from '$lib/vocab/tie/tie.js';
import {checkEntityPath, isDirectory, scrubEntityPath} from '$lib/vocab/entity/entityHelpers.js';
import {
	checkAddOrderedItem,
	checkRemoveOrderedItems,
	cleanOrphanedEntities,
	updateDirectories,
} from '$lib/vocab/entity/entityHelpers.server.js';
import {checkEntityOwnership, checkEntityAccess} from '$lib/vocab/policy/policyHelpers.server.js';
import {ApiError, assertApiError} from '$lib/server/api.js';
import {DEFAULT_PAGE_SIZE} from '$lib/util/constants.js';

const log = new Logger('[EntityServices]');

export const ReadEntitiesService: ServiceByName['ReadEntities'] = {
	action: ReadEntities,
	transaction: false,
	perform: async ({repos, params, checkHubAccess}) => {
		log.error(params);
		const {source_id, pageSize = DEFAULT_PAGE_SIZE, pageKey, related, orderBy} = params;
		log.debug('checking pagiated entities for ', source_id);
		const {hub_id} = await repos.space.findByEntity(source_id);
		await checkHubAccess(hub_id);

		const extraPageSize = pageSize + 1;
		const pageTies = await repos.tie.filterBySourceIdPaginated(
			source_id,
			extraPageSize,
			pageKey,
			orderBy,
		);
		const more = pageSize < pageTies.length;
		if (more) pageTies.pop();

		let relatedTies: Tie[] | null = null;
		if (related && pageTies.length) {
			const pageEntityIds = pageTies.map((t) => t.dest_id);
			relatedTies = await repos.tie.filterRelatedByEntityId(pageEntityIds, related);
		}
		const ties = relatedTies ? pageTies.concat(relatedTies) : pageTies.slice();

		//TODO stop filtering directory until we fix entity indexing by space_id
		const entityIds = toTieEntityIds(pageTies);
		entityIds.delete(source_id);
		const {entities} = await repos.entity.filterByIds(Array.from(entityIds), orderBy);
		log.error(entities);
		return {ok: true, status: 200, value: {entities, ties, more}};
	},
};

export const CreateEntityService: ServiceByName['CreateEntity'] = {
	action: CreateEntity,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {actor, data, space_id, path} = params;

		log.error(params);
		//TODO revist this, should data drive ties or vice versa?
		if (data.orderedItems?.length)
			throw new ApiError(400, 'cannot create entity with orderedItems directly');

		if (path) {
			//TODO MULTIPLE add lowercasing to path
			log.debug('[createEntity] validating space path uniqueness');
			const existingEntityWithPath = await repos.entity.findBySpacePath(space_id, path);
			if (existingEntityWithPath && !isDirectory(existingEntityWithPath)) {
				throw new ApiError(409, 'an entity with that path in this space already exists');
			}
		}

		const {hub_id, directory_id} = (await repos.space.findById(space_id))!;
		await checkPolicy('create_entity', hub_id);

		//TODO maybe construct orderedItems here
		let entity = await repos.entity.create(actor, space_id, hub_id, data, directory_id, path);

		log.error(entity);
		const entities = [entity];

		const ties: Tie[] = [];
		if (params.ties) {
			for (const tieParams of params.ties) {
				const {source_id, dest_id} =
					'source_id' in tieParams
						? {source_id: tieParams.source_id, dest_id: entity.entity_id}
						: {source_id: entity.entity_id, dest_id: tieParams.dest_id};
				const tie = await repos.tie.create(source_id, dest_id, tieParams.type || 'HasItem'); // eslint-disable-line no-await-in-loop
				ties.push(tie);
				const collection = await checkAddOrderedItem(repos, entity, tie); // eslint-disable-line no-await-in-loop
				if (collection) {
					if (entity.entity_id === collection.entity_id) {
						entity = collection;
						entities[0] = entity; // TODO pay attention to this when batched
					} else {
						entities.push(collection);
					}
				}
			}
		}

		const {updatedDirectories, hubIds} = await updateDirectories(
			repos,
			entities.map((e) => e.entity_id),
		);
		entities.push(...updatedDirectories);

		return {ok: true, status: 200, value: {entities, ties}, broadcast: hubIds};
	},
};

// TODO handle tombstones in governance to allow admins and those with permission
// (was formerly hardcoded in the repo, but that restriction was relaxed)
export const UpdateEntitiesService: ServiceByName['UpdateEntities'] = {
	action: UpdateEntities,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor} = params;

		// TODO add a bulk repo method (see this comment in multiple places)
		const entities = await Promise.all(
			params.entities.map(async (doc) => {
				const {entity_id, data} = doc;

				const entity = await repos.entity.findById(entity_id);
				if (!entity) throw new ApiError(404, 'no entity found');
				const entityIsDirectory = isDirectory(entity);

				//TODO revist this, should data drive ties or vice versa?
				if (data) {
					if (entityIsDirectory) {
						throw new ApiError(405, 'cannot update directory data');
					}
					if (!dequal(new Set(data.orderedItems), new Set(entity.data.orderedItems))) {
						throw new ApiError(405, 'cannot update entity orderedItems directly');
					}
				}

				await checkEntityOwnership(repos, actor, [entity_id]);

				const path = scrubEntityPath(doc.path);

				if (path) {
					//TODO MULTIPLE add lowercasing to path
					if (entityIsDirectory) {
						throw new ApiError(405, 'cannot update directory path');
					}
					log.debug('[updateEntity] validating entity path');
					assertApiError(checkEntityPath(path));
					const existingEntityWithPath = await repos.entity.findBySpacePath(entity.space_id, path);
					if (existingEntityWithPath) {
						throw new ApiError(409, 'an entity with that path already exists in this space ');
					}
				}

				return repos.entity.update(entity_id, data, path);
			}),
		);

		const {updatedDirectories, hubIds} = await updateDirectories(
			repos,
			entities.map((e) => e.entity_id),
		);
		entities.push(...updatedDirectories);

		return {ok: true, status: 200, value: {entities}, broadcast: hubIds};
	},
};

//soft deletes a single entity, leaving behind a Tombstone entity
export const EraseEntitiesService: ServiceByName['EraseEntities'] = {
	action: EraseEntities,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, entityIds} = params;
		await checkEntityOwnership(repos, actor, entityIds);

		const entities = await repos.entity.eraseByIds(entityIds);

		const {updatedDirectories, hubIds} = await updateDirectories(repos, entityIds);
		entities.push(...updatedDirectories);

		return {ok: true, status: 200, value: {entities}, broadcast: hubIds};
	},
};

//hard deletes one to many entities, removing the records from the DB
export const DeleteEntitiesService: ServiceByName['DeleteEntities'] = {
	action: DeleteEntities,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, entityIds} = params;
		await checkEntityOwnership(repos, actor, entityIds);

		const collections = await checkRemoveOrderedItems(repos, entityIds);

		const deleted = (await repos.entity.deleteByIds(entityIds)).map((e) => e.entity_id);

		await cleanOrphanedEntities(repos); // TODO probably return the ids here that got orphaned, and scope to the hub in the function

		const {updatedDirectories, hubIds} = await updateDirectories(repos, entityIds);

		const entities = collections.concat(updatedDirectories);

		return {
			ok: true,
			status: 200,
			value: {entities, deleted},
			broadcast: hubIds,
		};
	},
};

export const ReadEntitiesByIdService: ServiceByName['ReadEntitiesById'] = {
	action: ReadEntitiesById,
	transaction: false,
	perform: async ({repos, params}) => {
		//TODO make this batchable; need an answer to potential multiHubAccess & rejection question
		const {actor, entityIds} = params;

		await checkEntityAccess(repos, actor, entityIds);

		const {entities, missing} = await repos.entity.filterByIds(entityIds);
		if (!missing) {
			return {ok: true, status: 200, value: {entities}};
		} else {
			return {ok: false, status: 404, message: 'some entities not found'};
		}
	},
};
