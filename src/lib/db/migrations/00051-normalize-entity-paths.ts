import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
    UPDATE entities
    SET path = regexp_replace(path,'/.+?(?=/)','')
    WHERE path IS NOT NULL and data -> 'directory' IS NULL;
  `;
};
