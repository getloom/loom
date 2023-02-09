import {NOT_OK, OK, type Result} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {AccountPersona, Persona, PublicPersona} from '$lib/vocab/persona/persona';
import {ADMIN_PERSONA_ID, GHOST_PERSONA_ID, GHOST_PERSONA_NAME} from '$lib/app/constants';
import {PERSONA_COLUMNS} from '$lib/vocab/persona/personaHelpers.server';

const log = new Logger(gray('[') + blue('PersonaRepo') + gray(']'));

export class PersonaRepo extends PostgresRepo {
	// TODO is weird to return a `PublicPersona`, could fix by having
	// `PublicGhostPersona`, `PublicCommunityPersona`, and `PublicAccountPersona`
	// as separate types, see also `createCommunityPersona` and `createGhostPersona`
	async createAccountPersona(
		name: string,
		account_id: number,
		community_id: number,
	): Promise<Result<{value: AccountPersona}>> {
		const data = await this.sql<AccountPersona[]>`
			INSERT INTO personas (type, name, account_id, community_id) VALUES (
				'account', ${name}, ${account_id}, ${community_id}
			) RETURNING ${this.sql(PERSONA_COLUMNS.Persona)}
		`;
		const persona = data[0];
		log.trace('[createAccountPersona] created persona', persona);
		return {ok: true, value: persona};
	}

	async createCommunityPersona(
		name: string,
		community_id: number,
	): Promise<Result<{value: PublicPersona}>> {
		const data = await this.sql<PublicPersona[]>`
			INSERT INTO personas (type, name, community_id) VALUES (
				'community', ${name}, ${community_id}
			) RETURNING ${this.sql(PERSONA_COLUMNS.PublicPersona)}
		`;
		const persona = data[0];
		log.trace('[createCommunityPersona] created persona', persona);
		return {ok: true, value: persona};
	}

	async createGhostPersona(): Promise<Result<{value: PublicPersona}>> {
		const data = await this.sql<PublicPersona[]>`
			INSERT INTO personas (type, name) VALUES (
				'ghost', ${GHOST_PERSONA_NAME}
			) RETURNING ${this.sql(PERSONA_COLUMNS.PublicPersona)}
		`;
		const persona = data[0];
		if (persona.persona_id !== GHOST_PERSONA_ID) return NOT_OK;
		return {ok: true, value: persona};
	}

	async deleteById(persona_id: number): Promise<Result> {
		const data = await this.sql<any[]>`
			DELETE FROM personas WHERE persona_id=${persona_id}
		`;
		if (!data.count) return NOT_OK;
		return OK;
	}

	async filterByAccount(account_id: number): Promise<Result<{value: AccountPersona[]}>> {
		log.trace('[filterByAccount]', account_id);
		const data = await this.sql<AccountPersona[]>`
			SELECT ${this.sql(PERSONA_COLUMNS.Persona)}
			FROM personas WHERE account_id=${account_id}
		`;
		return {ok: true, value: data};
	}

	async filterAssociatesByAccount(account_id: number): Promise<Result<{value: PublicPersona[]}>> {
		const data = await this.sql<PublicPersona[]>`
			SELECT ${this.sql(PERSONA_COLUMNS.PublicPersona.map((c) => 'p3.' + c))}
			FROM personas p3
			JOIN (SELECT DISTINCT persona_id FROM assignments a2
				JOIN (SELECT DISTINCT a.community_id FROM assignments a
					JOIN (SELECT * FROM personas WHERE account_id=${account_id}) p
					ON p.persona_id=a.persona_id) c
				ON a2.community_id=c.community_id) p2
			ON p3.persona_id=p2.persona_id
			UNION
			SELECT ${this.sql(
				PERSONA_COLUMNS.PublicPersona,
			)} FROM personas WHERE persona_id=${ADMIN_PERSONA_ID} OR persona_id=${GHOST_PERSONA_ID}
		`;
		return {ok: true, value: data};
	}

	async findById<T extends Partial<Persona> = PublicPersona>(
		persona_id: number,
		columns = PERSONA_COLUMNS.PublicPersona,
	): Promise<Result<{value: T | undefined}>> {
		log.trace('[findById]', persona_id);
		const data = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE persona_id=${persona_id}
		`;
		return {ok: true, value: data[0]};
	}

	// TODO handle count mismatch similar to to the entity version of this method
	async filterByIds<T extends Partial<Persona> = PublicPersona>(
		personaIds: number[],
		columns = PERSONA_COLUMNS.PublicPersona,
	): Promise<Result<{value: {personas: T[]; missing: null | number[]}}>> {
		if (personaIds.length === 0) return {ok: true, value: {personas: [], missing: null}};
		const personas = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE persona_id IN ${this.sql(personaIds)}
		`;
		const missing =
			personas.length === personaIds.length
				? null
				: personaIds.filter((id) => !personas.some((e) => e.persona_id === id));
		return {ok: true, value: {personas, missing}};
	}

	async findByCommunity<T extends Partial<Persona> = PublicPersona>(
		community_id: number,
		columns = PERSONA_COLUMNS.PublicPersona,
	): Promise<Result<{value: T | undefined}>> {
		log.trace('[findByCommunity]', community_id);
		const data = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE community_id=${community_id}
		`;
		return {ok: true, value: data[0]};
	}

	async findByName<T extends Partial<Persona> = PublicPersona>(
		name: string,
		columns = PERSONA_COLUMNS.PublicPersona,
	): Promise<Result<{value: T | undefined}>> {
		log.trace('[findByName]', name);
		const data = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM personas WHERE LOWER(name) = LOWER(${name})
		`;
		return {ok: true, value: data[0]};
	}
}
