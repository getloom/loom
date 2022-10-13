/** @param {import('postgres').Sql<any>} sql */
export const up = async (sql) => {
	const communities = await sql`
		SELECT community_id, settings FROM communities;
	`;

	// Add `space_id` to directory data:
	for (const community of communities) {
		// eslint-disable-next-line no-await-in-loop
		const [role] = await sql`
    INSERT INTO roles (community_id, name) VALUES (
      ${community.community_id}, 'member'
    ) RETURNING *
		`;

		const settings = {
			...community.settings,
			defaultRoleId: role.role_id,
		};

		// eslint-disable-next-line no-await-in-loop
		await sql`
			UPDATE communities
			SET settings=${settings}
			WHERE community_id=${community.community_id}
		`;
	}
};
