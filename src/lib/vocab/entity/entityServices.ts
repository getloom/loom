import type {ServiceByName} from '$lib/app/actionTypes';
import {
	ReadEntities,
	ReadEntitiesPaginated,
	UpdateEntities,
	CreateEntity,
	EraseEntities,
	DeleteEntities,
} from '$lib/vocab/entity/entityActions';
import {toTieEntityIds} from '$lib/vocab/tie/tieHelpers';
import type {Tie} from '$lib/vocab/tie/tie';
import {checkEntityPath, scrubEntityPath} from '$lib/vocab/entity/entityHelpers';
import {cleanOrphanedEntities, updateDirectories} from '$lib/vocab/entity/entityHelpers.server';
import {
	checkHubAccess,
	checkEntityOwnership,
	checkPolicy,
} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';
import {ApiError} from '$lib/server/api';

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

		entities.push(...(await updateDirectories(repos, [entity.entity_id])));

		return {ok: true, status: 200, value: {entities, ties}};
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

				await checkEntityOwnership(actor, [entity_id], repos);

				const path = scrubEntityPath(doc.path);

				if (typeof path === 'string') {
					const errorMessage = checkEntityPath(path);
					if (errorMessage) throw new ApiError(400, errorMessage);
				}

				return repos.entity.update(entity_id, data, path);
			}),
		);

		entities.push(
			...(await updateDirectories(
				repos,
				entities.map((e) => e.entity_id),
			)),
		);

		return {ok: true, status: 200, value: {entities}};
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

		entities.push(...(await updateDirectories(repos, entityIds)));

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

		const deleted = (await repos.entity.deleteByIds(entityIds)).map((e) => e.entity_id);

		await cleanOrphanedEntities(repos); // TODO probably return the ids here that got orphaned, and scope to the hub in the function

		const entities = await updateDirectories(repos, entityIds);

		return {ok: true, status: 200, value: {entities, deleted}};
	},
};
