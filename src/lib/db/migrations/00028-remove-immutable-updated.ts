import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TABLE memberships
		DROP COLUMN updated;
	`;
	await sql`
	  ALTER TABLE ties
	  DROP COLUMN updated;
	`;
};
