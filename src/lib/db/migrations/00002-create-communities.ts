import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		create table if not exists communities (
			community_id serial primary key,
			name text,
			created timestamp NOT NULL DEFAULT now(),
			updated timestamp
		)	
	`;
};
