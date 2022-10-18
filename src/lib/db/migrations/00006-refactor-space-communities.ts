import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TABLE spaces
		ADD community_id int REFERENCES communities (community_id) ON UPDATE CASCADE ON DELETE CASCADE;
	`;

	await sql`
	UPDATE spaces S 
	SET community_id = CS.community_id 
	FROM community_spaces CS 
	WHERE S.space_id = CS.space_id;
	`;

	await sql`
	DROP TABLE community_spaces;
	`;
};
