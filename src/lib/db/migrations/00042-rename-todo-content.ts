import type {Sql} from 'postgres';

/* eslint-disable no-await-in-loop */

export const up = async (sql: Sql<any>): Promise<void> => {
	const entities = await sql`
		SELECT * FROM entities WHERE data ? 'name' AND NOT data ? 'content'
	`;
	for (const entity of entities) {
		const data = {...entity.data, content: entity.name, name: undefined};
		await sql`
			UPDATE entities
			SET data=${sql.json(data)}
			WHERE entity_id=${entity.entity_id}
		`;
	}
};
