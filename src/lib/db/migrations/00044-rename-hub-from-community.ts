import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`ALTER TABLE communities RENAME TO hubs;`;
	await sql`ALTER TABLE hubs RENAME COLUMN community_id TO hub_id;`;
	await sql`ALTER TABLE hubs RENAME CONSTRAINT communities_pkey TO hubs_pkey;`;
	await sql`ALTER TABLE personas RENAME COLUMN community_id TO hub_id;`;
	await sql`ALTER TABLE spaces RENAME COLUMN community_id TO hub_id;`;
	await sql`ALTER TABLE roles RENAME COLUMN community_id TO hub_id;`;
	await sql`ALTER TABLE assignments RENAME COLUMN community_id TO hub_id;`;
	await sql`ALTER TYPE community_type RENAME VALUE 'standard' TO 'community';`;
	await sql`ALTER TYPE community_type RENAME TO hub_type;`;
	await sql`ALTER TABLE personas RENAME CONSTRAINT personas_community_id_fkey TO personas_hub_id_fkey;`;
	await sql`ALTER TABLE spaces RENAME CONSTRAINT spaces_community_id_fkey TO spaces_hub_id_fkey;`;
	await sql`ALTER TABLE roles RENAME CONSTRAINT roles_community_id_fkey TO roles_hub_id_fkey;`;
	await sql`ALTER TABLE assignments RENAME CONSTRAINT memberships_community_id_fkey TO assignments_hub_id_fkey;`;
	await sql`ALTER TABLE assignments RENAME CONSTRAINT memberships_pkey TO assignments_pkey;`;
	await sql`ALTER TABLE assignments RENAME CONSTRAINT memberships_persona_id_fkey TO assignments_persona_id_fkey;`;
};
