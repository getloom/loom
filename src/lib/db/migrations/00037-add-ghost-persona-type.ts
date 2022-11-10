import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
		ALTER TYPE persona_type ADD VALUE 'ghost';
	`;
};
