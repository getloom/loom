import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TABLE accounts
			ADD COLUMN settings jsonb
			NOT NULL DEFAULT '{}';
	`;
};
