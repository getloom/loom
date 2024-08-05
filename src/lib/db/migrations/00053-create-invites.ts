import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
	CREATE TABLE IF NOT EXISTS invites (
		invite_id serial primary key,
        code text UNIQUE,
		from_id int REFERENCES accounts (account_id) ON UPDATE CASCADE ON DELETE CASCADE,
        to_id int REFERENCES accounts (account_id) ON UPDATE CASCADE ON DELETE CASCADE,
		status text,
		created timestamp NOT NULL DEFAULT now(),
		updated timestamp		
	)
	`;
};
