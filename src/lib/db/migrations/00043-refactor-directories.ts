import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
    UPDATE entities
    SET data = data || jsonb_build_object('directory',true)
    WHERE data ? 'space_id';
`;

	await sql`
    UPDATE entities
    SET data = data - 'space_id'
    WHERE data ? 'space_id';
`;
};
