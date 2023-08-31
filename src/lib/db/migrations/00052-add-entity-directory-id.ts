import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	// add `directory_id` to entities
	await sql`
    ALTER TABLE entities
		ADD COLUMN directory_id int
		REFERENCES entities(entity_id) ON UPDATE CASCADE ON DELETE CASCADE;
    `;
	// migrate existing data for directory_id
	await sql`
		UPDATE entities
		SET directory_id=spaces.directory_id
		FROM spaces
		WHERE entities.space_id=spaces.space_id;
		`;
	// after migrating directory_id, set contraints
	await sql`
		ALTER TABLE entities
		ALTER COLUMN directory_id
		SET NOT NULL
	`;

	// add `hub_id` to entities
	await sql`
    ALTER TABLE entities
		ADD COLUMN hub_id int
		REFERENCES hubs(hub_id) ON UPDATE CASCADE ON DELETE CASCADE;
    `;
	// migrate existing data for hub_id
	await sql`
		UPDATE entities
		SET hub_id=spaces.hub_id
		FROM spaces
		WHERE entities.space_id=spaces.space_id;
		`;
	// after migrating hub_id, set contraints
	await sql`
		ALTER TABLE entities
		ALTER COLUMN hub_id
		SET NOT NULL
	`;

	// index some columns
	await sql`CREATE INDEX ON spaces (directory_id);`;
	await sql`CREATE INDEX ON entities (directory_id);`;
	await sql`CREATE INDEX ON entities (hub_id);`;
	await sql`CREATE INDEX ON entities (space_id);`;
	await sql`CREATE INDEX ON entities (actor_id);`;

	await sql`ALTER SEQUENCE files_file_id_seq RENAME TO items_item_id_seq`;
};
