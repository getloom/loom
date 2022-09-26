/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	// Change the ties pkey to a unique constraint, so the `tie_id` can be the pkey.
	await sql`
		ALTER TABLE ties
		DROP CONSTRAINT ties_pkey;
	`;
	await sql`
		ALTER TABLE ties
		ADD UNIQUE (source_id, dest_id, type);
	`;
	// TODO we'd prefer to use `bigserial` here instead of `serial`,
	// but ajv-keywords doesn't currently support it:
	// https://github.com/ajv-validator/ajv-keywords/issues/251
	await sql`
		ALTER TABLE ties
		ADD COLUMN tie_id serial PRIMARY KEY;
	`;
};
