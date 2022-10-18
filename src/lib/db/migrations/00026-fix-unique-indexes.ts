import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	// accounts have a UNIQUE constraint on `name`,
	// but instead we want a UNIQUE INDEX on the lowercased name
	await sql`
		ALTER TABLE accounts
		DROP CONSTRAINT accounts_name_key;
	`;
	await sql`
		CREATE UNIQUE INDEX
		ON accounts (LOWER(name));
	`;

	// personas have both a UNIQUE constraint and index on `name`,
	// but instead we want a UNIQUE INDEX on the lowercased name
	await sql`
		DROP INDEX personas_lower_idx;
	`;
	await sql`
		ALTER TABLE personas
		DROP CONSTRAINT personas_name_key;
	`;
	await sql`
		CREATE UNIQUE INDEX
		ON personas (LOWER(name));
	`;

	// communities have no unique constraints or index,
	// and we want a UNIQUE INDEX on the lowercased name
	await sql`
		CREATE UNIQUE INDEX
		ON communities (LOWER(name));
	`;
};
