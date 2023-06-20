import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TABLE policies
		RENAME COLUMN permission
		TO name;
	`;
};
