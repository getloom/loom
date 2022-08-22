/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE memberships
		DROP COLUMN updated;
	`;
	await sql`
	  ALTER TABLE ties
	  DROP COLUMN updated;
	`;
};
