import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TABLE memberships
		DROP CONSTRAINT membership_pkey;
	`;

	await sql`
		ALTER TABLE memberships
		ADD COLUMN membership_id serial PRIMARY KEY;
	`;
};
