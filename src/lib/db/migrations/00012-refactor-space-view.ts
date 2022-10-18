import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TABLE spaces
		ALTER COLUMN content TYPE jsonb USING content::jsonb;
	`;

	await sql`
		ALTER TABLE spaces RENAME COLUMN content TO view;
	`;
};
