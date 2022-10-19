import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`ALTER TABLE memberships RENAME TO assignments;`;
	await sql`ALTER TABLE assignments RENAME COLUMN membership_id TO assignment_id;`;
};
