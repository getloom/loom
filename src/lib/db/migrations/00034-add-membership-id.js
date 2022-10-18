/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
		ALTER TABLE memberships
		DROP CONSTRAINT membership_pkey;
	`;

	await sql`
		ALTER TABLE memberships
		ADD COLUMN membership_id serial PRIMARY KEY;
	`;
};
