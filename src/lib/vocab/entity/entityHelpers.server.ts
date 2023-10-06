import {Logger} from '@grogarden/util/log.js';

import {blue, gray} from '$lib/server/colors.js';
import type {Repos} from '$lib/db/Repos.js';
import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
import type {Directory} from '$lib/vocab/entity/entityData.js';
import type {HubId} from '$lib/vocab/hub/hub.js';
import type {Tie} from '$lib/vocab/tie/tie.js';

const log = new Logger(gray('[') + blue('entityHelpers.server') + gray(']'));

export type EntityColumn = keyof Entity;
export const ENTITY_COLUMNS = {
	all: [
		'entity_id',
		'space_id',
		'directory_id',
		'hub_id',
		'path',
		'data',
		'actor_id',
		'created',
		'updated',
	],
	entity_id: ['entity_id'],
} satisfies Record<string, EntityColumn[]>;

export const cleanOrphanedEntities = async (repos: Repos): Promise<void> => {
	log.debug('checking for orphaned entities');
	// Deleting one entity may orphan others, so loop until there are no more orphans.
	// TODO optimize this into a single SQL statement (recursive?)
	while (true) {
		const orphans = await repos.entity.filterOrphanedEntities(); // eslint-disable-line no-await-in-loop
		if (orphans.length === 0) {
			break;
		}
		await repos.entity.deleteByIds(orphans.map((e) => e.entity_id)); // eslint-disable-line no-await-in-loop
	}
};

export const updateDirectories = async (
	repos: Repos,
	entityIds: EntityId[],
): Promise<{updatedDirectories: Directory[]; hubIds: HubId[]}> => {
	const directoryIds = Array.from(
		new Set(
			(
				await Promise.all(
					entityIds.map((entity_id) =>
						repos.entity.filterDirectoriesByEntity(entity_id, ENTITY_COLUMNS.entity_id),
					),
				)
			).flatMap((directories) => directories.map((d) => d.entity_id)),
		),
	);

	const updatedDirectories = await Promise.all(
		directoryIds.map(async (directoryId) => repos.entity.update(directoryId) as Promise<Directory>),
	);
	const hubIds = updatedDirectories.map((d) => d.hub_id);

	// TODO add a bulk repo method (see this comment in multiple places)
	return {updatedDirectories, hubIds};
};

/** This helper function takes a newly created entity & tie and checks
 * to see if the source entity needs its orderedItems attribute updated
 *
 * @param repos - the db repos
 * @param createdEntity - the newly created entity, may or may not have orderedItems
 * @param tie - the newly created relationship
 * @returns either the updated entity with orderedItems or void if no change
 */
export const checkAddOrderedItem = async (
	repos: Repos,
	createdEntity: Entity,
	tie: Tie,
): Promise<Entity | void> => {
	if (tie.type !== 'HasItem') return;
	const source =
		createdEntity.entity_id === tie.source_id
			? createdEntity
			: await repos.entity.findById(tie.source_id);
	if (source?.data.orderedItems) {
		source.data.orderedItems.push(tie.dest_id);
		const collection = await repos.entity.update(source.entity_id, source.data);
		return collection;
	}
};

/** This helper function takes a newly deleted entity and checks
 * to see if any source entities needs an orderedItems attribute updated
 *
 * @param repos - the db repos
 * @param createdEntity - the newly created entity, may or may not have orderedItems
 * @param tie - the newly created relationship
 * @returns either the updated entity with orderedItems or void if no change
 */
export const checkRemoveOrderedItems = async (
	repos: Repos,
	deletedEntities: EntityId[],
): Promise<Entity[]> => {
	const updatedEntities: Entity[] = [];
	const ties = (await repos.tie.filterRelatedByEntityId(deletedEntities, 'dest')).filter(
		(t) => t.type === 'HasItem',
	);
	for (const tie of ties) {
		// eslint-disable-next-line no-await-in-loop
		const collection = await repos.entity.findById(tie.source_id);
		if (collection?.data.orderedItems) {
			const index = collection.data.orderedItems.indexOf(tie.dest_id);
			if (index > -1) {
				collection.data.orderedItems.splice(index, 1);
				// eslint-disable-next-line no-await-in-loop
				const entity = await repos.entity.update(collection.entity_id, collection.data);
				updatedEntities.push(entity);
			}
		}
	}
	return updatedEntities;
};
