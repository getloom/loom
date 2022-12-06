import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TABLE spaces RENAME COLUMN url TO path;
	`;
};
