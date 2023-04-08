import type {Sql} from 'postgres';

const GHOST_ACTOR_ID = 2;

export const up = async (sql: Sql<any>): Promise<void> => {
	const [ghostActor] = await sql`SELECT * FROM personas WHERE persona_id=${GHOST_ACTOR_ID}`;
	if (!ghostActor || ghostActor.type === 'ghost') return;

	// Move the existing persona -- all references to `personas.persona_id` cascade except one (see ahead).
	const [{persona_id}] = await sql`
		UPDATE personas
		SET persona_id=(1 + (SELECT max(persona_id) from personas))
		WHERE persona_id=${GHOST_ACTOR_ID}
		RETURNING persona_id;
	`;
	// Fix the serial `persona_id`.
	await sql`SELECT setval('personas_persona_id_seq', ${persona_id}, true)`;
	// Change all entities with `persona_id=2` to the new one.
	// Currently `entity.persona_id` is not a foreign key, so unlike the rest it doesn't cascade.
	await sql`
		UPDATE entities
		SET persona_id=${persona_id}
		WHERE persona_id=${GHOST_ACTOR_ID};
	`;
	// Create the ghost persona record.
	await sql`
		INSERT INTO personas (persona_id, type, name)
		VALUES (${GHOST_ACTOR_ID}, 'ghost', 'ghost')
	`;
};
