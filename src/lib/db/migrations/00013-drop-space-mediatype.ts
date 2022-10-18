import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TABLE spaces
		DROP COLUMN media_type;
	`;
};
