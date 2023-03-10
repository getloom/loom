import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	// Removes `space.path` in favor of its directory `entity.path`, and copies over any `space.path`.
	const spaces = await sql`SELECT directory_id, path FROM spaces`;
	for (const space of spaces) {
		if (space.path) {
			await sql`UPDATE entities SET path=${space.path} WHERE entity_id=${space.directory_id}`; // eslint-disable-line no-await-in-loop
		}
	}

	await sql`ALTER TABLE spaces DROP COLUMN path;`;
};
