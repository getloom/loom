import {Logger} from '@feltjs/util/log.js';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Tie} from '$lib/vocab/tie/tie';
import {DEFAULT_PAGE_SIZE} from '$lib/app/constants';

const log = new Logger('[TieRepo]');

export class TieRepo extends PostgresRepo {
	async create(source_id: number, dest_id: number, type: string): Promise<Tie> {
		const tie = await this.sql<Tie[]>`
			INSERT INTO ties (source_id, dest_id, type) VALUES (
				${source_id},${dest_id},${type}
			) RETURNING *
		`;
		// log.debug('create entity', data);
		return tie[0];
	}

	async filterBySourceId(source_id: number): Promise<Tie[]> {
		log.debug(`preparing to walk graph starting with source: ${source_id}`);
		const ties = await this.sql<Tie[]>`
			WITH RECURSIVE paths (tie_id, source_id, dest_id, type, created, path) AS (
				SELECT t.tie_id, t.source_id, t.dest_id, t.type, t.created, ARRAY[t.source_id, t.dest_id]
					FROM ties t WHERE source_id=${source_id}
				UNION ALL
					SELECT t.tie_id, t.source_id, t.dest_id, t.type,t.created, p.path || ARRAY[t.dest_id]
					FROM paths p
					JOIN ties t
					ON p.dest_id = t.source_id AND t.dest_id != ALL(p.path)
			)
			SELECT DISTINCT tie_id, source_id, dest_id, type, created FROM paths;
		`;
		log.debug('ties under source', ties);
		return ties;
	}

	async filterByDestId(dest_id: number): Promise<Tie[]> {
		log.debug(`preparing to walk graph starting with dest: ${dest_id}`);
		const ties = await this.sql<Tie[]>`
			WITH RECURSIVE paths (tie_id, source_id, dest_id, type, created, path) AS (
				SELECT t.tie_id, t.source_id, t.dest_id, t.type, t.created, ARRAY[t.source_id, t.dest_id]
					FROM ties t WHERE dest_id=${dest_id}
				UNION ALL
					SELECT t.tie_id, t.source_id, t.dest_id, t.type,t.created, p.path || ARRAY[t.source_id]
					FROM paths p
					JOIN ties t
					ON p.source_id = t.dest_id AND t.source_id != ALL(p.path)
			)
			SELECT DISTINCT tie_id, source_id, dest_id, type, created FROM paths;
		`;
		log.debug('all ties pointing at dest', ties);
		return ties;
	}

	//This query returns a set of ties (size == pageSize) in a way
	//which allows for pagination. Sets are sorted from newest to oldest.
	//To get the next page of results, provide same source_id
	//But for the pageKey put the oldest/last dest_id as the pageKey
	async filterBySourceIdPaginated(
		source_id: number,
		pageSize = DEFAULT_PAGE_SIZE,
		pageKey?: number,
	): Promise<Tie[]> {
		log.debug(`paginated query of tie dests`, source_id, pageKey, pageSize);
		const ties = await this.sql<Tie[]>`
			SELECT t.tie_id, t.source_id, t.dest_id, t.type, t.created
			FROM ties t WHERE source_id=${source_id} ${
			pageKey ? this.sql`AND dest_id < ${pageKey}` : this.sql``
		} 
			ORDER BY dest_id DESC LIMIT ${pageSize};
		`;
		log.debug('directory ties', ties);
		return ties;
	}

	async deleteById(tie_id: number): Promise<void> {
		log.debug('[deleteById]', tie_id);
		const data = await this.sql<any[]>`
			DELETE FROM ties WHERE tie_id=${tie_id}
		`;
		if (!data.count) throw Error('no tie was deleted');
	}
}
