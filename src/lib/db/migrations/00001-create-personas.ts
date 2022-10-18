import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		create table if not exists personas (
			persona_id serial primary key,
			account_id int,
			name text UNIQUE,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)
	`;

	await sql`
		CREATE
		INDEX ON personas (LOWER(name));
	`;
};
