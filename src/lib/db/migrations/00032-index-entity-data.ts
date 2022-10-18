import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	// Add indices for the `data` property of entities.
	await sql`
		CREATE INDEX entities_data_idx ON entities USING gin (data);
	`;
};
