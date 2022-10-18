import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`ALTER TABLE files RENAME TO entities;`;
	await sql`ALTER TABLE entities RENAME COLUMN file_id TO entity_id;`;
};
