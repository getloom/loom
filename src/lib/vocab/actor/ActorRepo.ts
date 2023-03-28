import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {AccountPersona, Persona, PublicPersona} from '$lib/vocab/actor/persona';
import {ADMIN_ACTOR_ID, GHOST_ACTOR_ID, GHOST_ACTOR_NAME} from '$lib/app/constants';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

const log = new Logger(gray('[') + blue('ActorRepo') + gray(']'));

export class ActorRepo extends PostgresRepo {
	// TODO is weird to return a `PublicPersona`, could fix by having
	// `PublicGhostPersona`, `PublicCommunityPersona`, and `PublicAccountPersona`
	// as separate types, see also `createCommunityPersona` and `createGhostPersona`
	async createAccountPersona(
		name: string,
		account_id: number,
		hub_id: number,
	): Promise<AccountPersona> {
		const data = await this.sql<AccountPersona[]>`
			INSERT INTO personas (type, name, account_id, hub_id) VALUES (
				'account', ${name}, ${account_id}, ${hub_id}
			) RETURNING ${this.sql(ACTOR_COLUMNS.Persona)}
		`;
		const persona = data[0];
		log.debug('[createAccountPersona] created persona', persona);
		return persona;
	}

	async createCommunityPersona(name: string, hub_id: number): Promise<PublicPersona> {
		const data = await this.sql<PublicPersona[]>`
			INSERT INTO personas (type, name, hub_id) VALUES (
				'community', ${name}, ${hub_id}
			) RETURNING ${this.sql(ACTOR_COLUMNS.PublicPersona)}
		`;
		const persona = data[0];
		log.debug('[createCommunityPersona] created persona', persona);
		return persona;
	}

	async createGhostPersona(): Promise<PublicPersona> {
		const data = await this.sql<PublicPersona[]>`
			INSERT INTO personas (type, name) VALUES (
				'ghost', ${GHOST_ACTOR_NAME}
			) RETURNING ${this.sql(ACTOR_COLUMNS.PublicPersona)}
		`;
		const persona = data[0];
		if (persona.persona_id !== GHOST_ACTOR_ID) throw Error();
		return persona;
	}

	async deleteById(persona_id: number): Promise<void> {
		const data = await this.sql<any[]>`
			DELETE FROM personas WHERE persona_id=${persona_id}
		`;
		if (!data.count) throw Error();
	}

	async filterByAccount(account_id: number): Promise<AccountPersona[]> {
		log.debug('[filterByAccount]', account_id);
		const data = await this.sql<AccountPersona[]>`
			SELECT ${this.sql(ACTOR_COLUMNS.Persona)}
			FROM personas WHERE account_id=${account_id}
		`;
		return data;
	}

	async filterAssociatesByAccount(account_id: number): Promise<PublicPersona[]> {
		const data = await this.sql<PublicPersona[]>`
			SELECT ${this.sql(ACTOR_COLUMNS.PublicPersona.map((c) => 'p3.' + c))}
			FROM personas p3
			JOIN (SELECT DISTINCT persona_id FROM assignments a2
				JOIN (SELECT DISTINCT a.hub_id FROM assignments a
					JOIN (SELECT * FROM personas WHERE account_id=${account_id}) p
					ON p.persona_id=a.persona_id) c
				ON a2.hub_id=c.hub_id) p2
			ON p3.persona_id=p2.persona_id
			UNION
			SELECT ${this.sql(
				ACTOR_COLUMNS.PublicPersona,
			)} FROM personas WHERE persona_id=${ADMIN_ACTOR_ID} OR persona_id=${GHOST_ACTOR_ID}
		`;
		return data;
	}

	async findById<T extends Partial<Persona> = PublicPersona>(
		persona_id: number,
		columns = ACTOR_COLUMNS.PublicPersona,
	): Promise<T | undefined> {
		log.debug('[findById]', persona_id);
		const data = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE persona_id=${persona_id}
		`;
		return data[0];
	}

	// TODO handle count mismatch similar to to the entity version of this method
	async filterByIds<T extends Partial<Persona> = PublicPersona>(
		personaIds: number[],
		columns = ACTOR_COLUMNS.PublicPersona,
	): Promise<{personas: T[]; missing: null | number[]}> {
		if (personaIds.length === 0) return {personas: [], missing: null};
		const personas = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE persona_id IN ${this.sql(personaIds)}
		`;
		const missing =
			personas.length === personaIds.length
				? null
				: personaIds.filter((id) => !personas.some((e) => e.persona_id === id));
		return {personas, missing};
	}

	async findByHub<T extends Partial<Persona> = PublicPersona>(
		hub_id: number,
		columns = ACTOR_COLUMNS.PublicPersona,
	): Promise<T | undefined> {
		log.debug('[findByHub]', hub_id);
		const data = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE hub_id=${hub_id}
		`;
		return data[0];
	}

	async findByName<T extends Partial<Persona> = PublicPersona>(
		name: string,
		columns = ACTOR_COLUMNS.PublicPersona,
	): Promise<T | undefined> {
		log.debug('[findByName]', name);
		const data = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE LOWER(name) = LOWER(${name})
		`;
		return data[0];
	}
}