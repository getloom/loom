import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {Repos} from '$lib/db/Repos';
import type {Entity, EntityId} from '$lib/vocab/entity/entity';
import type {Directory} from '$lib/vocab/entity/entityData';

const log = new Logger(gray('[') + blue('entityHelpers.server') + gray(']'));

export type EntityColumn = keyof Entity;
export const ENTITY_COLUMNS = {
	EntityId: ['entity_id'],
	Entity: ['entity_id', 'space_id', 'path', 'data', 'persona_id', 'created', 'updated'],
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
): Promise<Directory[]> => {
	const directoryIds = Array.from(
		new Set(
			(
				await Promise.all(
					entityIds.map((entity_id) =>
						repos.entity.filterDirectoriesByEntity(entity_id, ENTITY_COLUMNS.EntityId),
					),
				)
			).flatMap((directories) => directories.map((d) => d.entity_id)),
		),
	);

	// TODO add a bulk repo method (see this comment in multiple places)
	return Promise.all(
		directoryIds.map(async (directoryId) => repos.entity.update(directoryId) as Promise<Directory>),
	);
};
