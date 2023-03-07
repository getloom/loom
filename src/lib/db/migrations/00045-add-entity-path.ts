import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`ALTER TABLE entities ADD COLUMN path text;`;
	await sql`CREATE INDEX entities_path_idx ON entities (path);`;
};
