import {OK, unwrap, type Result} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {Repos} from '$lib/db/Repos';

const log = new Logger(gray('[') + blue('entityHelpers.server') + gray(']'));

export const cleanOrphanedEntities = async (repos: Repos): Promise<Result> => {
	log.trace('checking for orphaned entities');
	// Deleting one entity may orphan others, so loop until there are no more orphans.
	// TODO optimize this into a single SQL statement (recursive?)
	while (true) {
		const orphans = unwrap(await repos.entity.filterOrphanedEntities()); // eslint-disable-line no-await-in-loop
		if (orphans.length === 0) {
			break;
		}
		unwrap(await repos.entity.deleteByIds(orphans.map((e) => e.entity_id))); // eslint-disable-line no-await-in-loop
	}
	return OK;
};
