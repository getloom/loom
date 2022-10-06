/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	// Add indices for the `data` property of entities.
	await sql`
		CREATE INDEX entities_data_idx ON entities USING gin (data);
	`;
};
