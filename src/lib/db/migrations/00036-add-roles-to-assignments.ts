import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	await sql`
  ALTER TABLE assignments
  ADD COLUMN role_id int REFERENCES roles (role_id) ON UPDATE CASCADE ON DELETE CASCADE;
`;

	await sql`
    UPDATE assignments
    SET role_id=(communities.settings->>'defaultRoleId')::int
    FROM communities
    WHERE assignments.community_id=communities.community_id;
  `;

	await sql`
    ALTER TABLE assignments
    ALTER COLUMN role_id
    SET NOT NULL
  `;

	await sql`
		ALTER TABLE assignments
		ADD UNIQUE (persona_id, community_id, role_id);
	`;
};
