import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
	 UPDATE entities
	 SET content = concat('{"type":"Note","content":',to_json(content),'}');
	 `;

	await sql`
	ALTER TABLE entities
	ALTER COLUMN content TYPE jsonb USING content::jsonb;
	`;

	await sql`ALTER TABLE entities RENAME COLUMN content TO data;`;
};
