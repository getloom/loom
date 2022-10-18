import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
    ALTER TABLE ties
    DROP CONSTRAINT UC_ties;
  `;

	await sql`
    ALTER TABLE ties 
    ADD PRIMARY KEY (source_id,dest_id,type);
  `;
};
