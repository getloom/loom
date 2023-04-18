import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`ALTER TABLE personas RENAME TO actors`;
	await sql`ALTER TABLE actors RENAME COLUMN persona_id TO actor_id`;
	await sql`ALTER TABLE actors RENAME CONSTRAINT personas_pkey TO actors_pkey`;
	await sql`ALTER TABLE actors RENAME CONSTRAINT personas_hub_id_fkey TO actors_hub_id_fkey`;
	await sql`ALTER TABLE actors RENAME CONSTRAINT personas_account_id_fkey TO actors_account_id_fkey`;
	await sql`ALTER TABLE assignments RENAME COLUMN persona_id TO actor_id`;
	await sql`ALTER TABLE assignments RENAME CONSTRAINT assignments_persona_id_fkey TO assignments_actor_id_fkey`;
	await sql`ALTER TABLE assignments RENAME CONSTRAINT assignments_persona_id_community_id_role_id_key TO assignments_actor_id_hub_id_role_id_key`;
	await sql`ALTER TABLE entities RENAME COLUMN persona_id TO actor_id`;
	await sql`ALTER TABLE entities RENAME CONSTRAINT files_pkey TO entities_pkey`;
	await sql`ALTER TABLE entities RENAME CONSTRAINT fk_entities_personas TO entities_actor_id_fkey`;
	await sql`ALTER INDEX personas_lower_idx RENAME TO actors_lower_idx`;
	await sql`ALTER TYPE persona_type RENAME TO actor_type`;
	await sql`ALTER SEQUENCE personas_persona_id_seq RENAME TO actors_actor_id_seq`;
};
