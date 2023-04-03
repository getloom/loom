import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {AccountActor, Actor, PublicActor, ActorId} from '$lib/vocab/actor/actor';
import {ADMIN_ACTOR_ID, GHOST_ACTOR_ID, GHOST_ACTOR_NAME} from '$lib/app/constants';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

const log = new Logger(gray('[') + blue('ActorRepo') + gray(']'));

export class ActorRepo extends PostgresRepo {
	// TODO is weird to return a `PublicActor`, could fix by having
	// `PublicGhostActor`, `PublicCommunityActor`, and `PublicAccountActor`
	// as separate types, see also `createCommunityActor` and `createGhostActor`
	async createAccountActor(
		name: string,
		account_id: number,
		hub_id: number,
	): Promise<AccountActor> {
		const data = await this.sql<AccountActor[]>`
			INSERT INTO personas (type, name, account_id, hub_id) VALUES (
				'account', ${name}, ${account_id}, ${hub_id}
			) RETURNING ${this.sql(ACTOR_COLUMNS.Persona)}
		`;
		const persona = data[0];
		log.debug('[createAccountActor] created persona', persona);
		return persona;
	}

	async createCommunityActor(name: string, hub_id: number): Promise<PublicActor> {
		const data = await this.sql<PublicActor[]>`
			INSERT INTO personas (type, name, hub_id) VALUES (
				'community', ${name}, ${hub_id}
			) RETURNING ${this.sql(ACTOR_COLUMNS.PublicActor)}
		`;
		const persona = data[0];
		log.debug('[createCommunityActor] created persona', persona);
		return persona;
	}

	async createGhostPersona(): Promise<PublicActor> {
		const data = await this.sql<PublicActor[]>`
			INSERT INTO personas (type, name) VALUES (
				'ghost', ${GHOST_ACTOR_NAME}
			) RETURNING ${this.sql(ACTOR_COLUMNS.PublicActor)}
		`;
		const persona = data[0];
		if (persona.persona_id !== GHOST_ACTOR_ID) throw Error();
		return persona;
	}

	async deleteById(persona_id: ActorId): Promise<void> {
		const data = await this.sql<any[]>`
			DELETE FROM personas WHERE persona_id=${persona_id}
		`;
		if (!data.count) throw Error();
	}

	async filterByAccount(account_id: number): Promise<AccountActor[]> {
		log.debug('[filterByAccount]', account_id);
		const data = await this.sql<AccountActor[]>`
			SELECT ${this.sql(ACTOR_COLUMNS.Persona)}
			FROM personas WHERE account_id=${account_id}
		`;
		return data;
	}

	async filterAssociatesByAccount(account_id: number): Promise<PublicActor[]> {
		const data = await this.sql<PublicActor[]>`
			SELECT ${this.sql(ACTOR_COLUMNS.PublicActor.map((c) => 'p3.' + c))}
			FROM personas p3
			JOIN (SELECT DISTINCT persona_id FROM assignments a2
				JOIN (SELECT DISTINCT a.hub_id FROM assignments a
					JOIN (SELECT * FROM personas WHERE account_id=${account_id}) p
					ON p.persona_id=a.persona_id) c
				ON a2.hub_id=c.hub_id) p2
			ON p3.persona_id=p2.persona_id
			UNION
			SELECT ${this.sql(
				ACTOR_COLUMNS.PublicActor,
			)} FROM personas WHERE persona_id=${ADMIN_ACTOR_ID} OR persona_id=${GHOST_ACTOR_ID}
		`;
		return data;
	}

	async findById<T extends Partial<Actor> = PublicActor>(
		persona_id: ActorId,
		columns = ACTOR_COLUMNS.PublicActor,
	): Promise<T | undefined> {
		log.debug('[findById]', persona_id);
		const data = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE persona_id=${persona_id}
		`;
		return data[0];
	}

	// TODO handle count mismatch similar to to the entity version of this method
	async filterByIds<T extends Partial<Actor> = PublicActor>(
		personaIds: number[],
		columns = ACTOR_COLUMNS.PublicActor,
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

	async findByHub<T extends Partial<Actor> = PublicActor>(
		hub_id: number,
		columns = ACTOR_COLUMNS.PublicActor,
	): Promise<T | undefined> {
		log.debug('[findByHub]', hub_id);
		const data = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE hub_id=${hub_id}
		`;
		return data[0];
	}

	async findByName<T extends Partial<Actor> = PublicActor>(
		name: string,
		columns = ACTOR_COLUMNS.PublicActor,
	): Promise<T | undefined> {
		log.debug('[findByName]', name);
		const data = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE LOWER(name) = LOWER(${name})
		`;
		return data[0];
	}
}
