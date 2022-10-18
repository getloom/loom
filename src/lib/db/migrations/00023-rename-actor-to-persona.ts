import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TABLE entities RENAME COLUMN actor_id TO persona_id;
	`;
};
