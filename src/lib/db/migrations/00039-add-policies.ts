import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
	CREATE TABLE IF NOT EXISTS policies (
		policy_id serial primary key,
		role_id int REFERENCES roles (role_id) ON UPDATE CASCADE ON DELETE CASCADE,
		permission text NOT NULL,
		data jsonb,
		created timestamp NOT NULL DEFAULT now(),
		updated timestamp		
	)
	`;
};
