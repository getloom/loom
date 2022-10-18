import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {AccountPersona, CommunityPersona, Persona} from '$lib/vocab/persona/persona';

const log = new Logger(gray('[') + blue('PersonaRepo') + gray(']'));

export class PersonaRepo extends PostgresRepo {
	// TODO instead of these null values, probably want a type union strongly typed for each persona type
	async createAccountPersona(
		name: string,
		account_id: number,
		community_id: number,
	): Promise<Result<{value: AccountPersona}>> {
		const data = await this.sql<AccountPersona[]>`
			INSERT INTO personas (type, name, account_id, community_id) VALUES (
				'account', ${name}, ${account_id}, ${community_id}
			) RETURNING *
		`;
		const persona = data[0];
		log.trace('[db] created persona', persona);
		return {ok: true, value: persona};
	}

	async createCommunityPersona(
		name: string,
		community_id: number,
	): Promise<Result<{value: CommunityPersona}>> {
		const data = await this.sql<CommunityPersona[]>`
			INSERT INTO personas (type, name, community_id) VALUES (
				'community', ${name}, ${community_id}
			) RETURNING *
		`;
		const persona = data[0];
		log.trace('[db] created persona', persona);
		return {ok: true, value: persona};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Persona[]}>> {
		log.trace('[filterByAccount]', account_id);
		const data = await this.sql<Persona[]>`
			SELECT persona_id, type, name, account_id, community_id, created, updated
			FROM personas WHERE account_id=${account_id}
		`;
		return {ok: true, value: data};
	}

	async findById(persona_id: number): Promise<Result<{value: Persona | undefined}>> {
		log.trace('[findById]', persona_id);
		const data = await this.sql<Persona[]>`
			SELECT persona_id, type, name, account_id, community_id, created, updated 
			FROM personas WHERE persona_id=${persona_id}
		`;
		return {ok: true, value: data[0]};
	}

	// TODO handle count mismatch similar to to the entity version of this method
	async filterByIds(
		personaIds: number[],
	): Promise<Result<{value: {personas: Persona[]; missing: null | number[]}}>> {
		if (personaIds.length === 0) return {ok: true, value: {personas: [], missing: null}};
		const personas = await this.sql<Persona[]>`
			SELECT persona_id, type, name, account_id, community_id, created, updated 
			FROM personas WHERE persona_id IN ${this.sql(personaIds)}
		`;
		const missing =
			personas.length === personaIds.length
				? null
				: personaIds.filter((id) => !personas.some((e) => e.persona_id === id));
		return {ok: true, value: {personas, missing}};
	}

	async findByCommunityId(community_id: number): Promise<Result<{value: Persona | undefined}>> {
		log.trace('[findByCommunityId]', community_id);
		const data = await this.sql<Persona[]>`
			SELECT persona_id, type, name, account_id, community_id, created, updated 
			FROM personas WHERE community_id=${community_id}
		`;
		return {ok: true, value: data[0]};
	}

	async findByName(name: string): Promise<Result<{value: Persona | undefined}>> {
		log.trace('[findByName]', name);
		const data = await this.sql<Persona[]>`
			SELECT persona_id, type, name, account_id, community_id, created, updated
			FROM personas WHERE LOWER(name) = LOWER(${name})
		`;
		return {ok: true, value: data[0]};
	}

	// TODO needs to be a subset just for the session, maybe either `community_ids` or `account_id` as a param
	// TODO this type isn't `Persona`, it's a public subset of fields
	async getAll(): Promise<Result<{value: Persona[]}>> {
		const data = await this.sql<Persona[]>`
			SELECT persona_id, name, type FROM personas
		`;
		return {ok: true, value: data};
	}
}
