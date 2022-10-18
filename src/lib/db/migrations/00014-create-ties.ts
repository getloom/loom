import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
	CREATE TABLE IF NOT EXISTS ties (
		source_id int REFERENCES entities (entity_id) ON UPDATE CASCADE ON DELETE CASCADE,
		dest_id int REFERENCES entities (entity_id) ON UPDATE CASCADE ON DELETE CASCADE,
		type text,
		created timestamp NOT NULL DEFAULT now(),
		updated timestamp		
	)
	`;

	await sql`
		CREATE
		INDEX ON ties (type);
	`;
};
