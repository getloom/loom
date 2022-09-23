/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	await sql`
	CREATE TABLE IF NOT EXISTS roles (
		role_id serial primary key,
		community_id int REFERENCES communities (community_id) ON UPDATE CASCADE ON DELETE CASCADE,
		name text,
		created timestamp NOT NULL DEFAULT now(),
		updated timestamp		
	)
	`;
};
