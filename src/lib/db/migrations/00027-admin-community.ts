import type {Sql} from 'postgres';

export const up = async (sql: Sql<any>): Promise<void> => {
	// Check if we need to migrate for the admin community and persona.
	const [community1] = await sql`SELECT * FROM communities WHERE community_id = 1`;
	if (!community1 || community1.name === 'admin') {
		return;
	}

	// At this point, we know we need to migrate existing data to the new assumptions.
	// The "admin" community and its persona are expected to have id 1.

	// Move the existing community -- all references to `communities.community_id` cascade.
	await sql`
		UPDATE communities
		SET community_id = (1 + (SELECT max(community_id) from communities))
		WHERE community_id = 1;
	`;
	// Move the existing persona -- all references to `personas.persona_id` cascade.
	const [{persona_id}] = await sql`
		UPDATE personas
		SET persona_id = (1 + (SELECT max(persona_id) from personas))
		WHERE persona_id = 1
		RETURNING persona_id;
	`;
	// Change all entities with `persona_id=1` to the new one.
	// Currently `entity.persona_id` is not a foreign key, so unlike the rest it doesn't cascade.
	await sql`
		UPDATE entities
		SET persona_id = ${persona_id}
		WHERE persona_id = 1;
	`;

	// Create a new standard community and its community persona with id 1.
	await sql`
		INSERT INTO communities (community_id, type, name, settings) VALUES (
			1, 'standard', 'admin', '{"hue": 294}'
		);
	`;
	await sql`
		INSERT INTO personas (persona_id, type, name, community_id) VALUES (
			1, 'community', 'admin', 1
		);
	`;
	// Create the membership for the persona that formerly had `persona_id` 1.
	await sql`
		INSERT INTO memberships (persona_id, community_id) VALUES (
			${persona_id}, 1
		);
	`;
};
