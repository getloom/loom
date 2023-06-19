import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
    UPDATE policies
    SET permission='UpdateHub'
    WHERE permission='UpdateHubSettings'
  `;
};
