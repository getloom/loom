/* eslint-disable no-await-in-loop */
import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TABLE entities
			ADD COLUMN space_id int REFERENCES spaces (space_id) ON UPDATE CASCADE ON DELETE CASCADE;
	`;

	await sql`
	ALTER TABLE entities
    ADD CONSTRAINT fk_entities_personas FOREIGN KEY (persona_id) REFERENCES personas (persona_id);
	`;

	const entites = await sql`
    SELECT * FROM entities;
  `;

	for (const entity of entites) {
		let space_id = 0;
		if (entity.data.space_id) {
			space_id = entity.data.space_id;
		} else {
			const dirs = await sql`
    SELECT DISTINCT e.entity_id, e.data, e.persona_id, e.created, e.updated FROM entities e
			JOIN (
			WITH RECURSIVE paths (tie_id, source_id, dest_id, type, created, path) AS (
				SELECT t.tie_id, t.source_id, t.dest_id, t.type, t.created, ARRAY[t.source_id, t.dest_id]
					FROM ties t WHERE dest_id=${entity.entity_id}
				UNION ALL
					SELECT t.tie_id, t.source_id, t.dest_id, t.type,t.created, p.path || ARRAY[t.source_id]
					FROM paths p
					JOIN ties t
					ON p.source_id = t.dest_id AND t.source_id != ALL(p.path)
			)
			SELECT DISTINCT tie_id, source_id, dest_id, type, created FROM paths
			) as tdest
			ON e.entity_id = tdest.source_id
			WHERE data ? 'space_id';
    `;
			if (dirs.length === 0) {
				await sql`DELETE FROM entities WHERE entity_id=${entity.entity_id}`;
				continue;
			}
			space_id = dirs[0].data.space_id;
		}

		const space = await sql`SELECT * FROM spaces WHERE space_id=${space_id}`;
		if (space.length === 0) {
			await sql`DELETE FROM entities WHERE entity_id=${entity.entity_id}`;
			continue;
		}

		await sql`
        UPDATE entities
        SET space_id=${space_id}
        WHERE entity_id=${entity.entity_id}
    `;
	}
};
