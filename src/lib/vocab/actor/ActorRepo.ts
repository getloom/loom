import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from 'kleur/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo.js';
import type {AccountActor, ActorRecord, PublicActor, ActorId} from '$lib/vocab/actor/actor.js';
import {ADMIN_ACTOR_ID, GHOST_ACTOR_ID, GHOST_ACTOR_NAME} from '$lib/util/constants.js';
import {ACTOR_COLUMNS, type ActorColumn} from '$lib/vocab/actor/actorHelpers.server.js';
import type {HubId} from '$lib/vocab/hub/hub.js';
import type {AccountId} from '$lib/vocab/account/account.js';

const log = new Logger(gray('[') + blue('ActorRepo') + gray(']'));

export class ActorRepo extends PostgresRepo {
	async createAccountActor(
		name: string,
		account_id: AccountId,
		hub_id: HubId,
	): Promise<AccountActor> {
		const data = await this.sql<AccountActor[]>`
			INSERT INTO actors (type, name, account_id, hub_id) VALUES (
				'account', ${name}, ${account_id}, ${hub_id}
			) RETURNING ${this.sql(ACTOR_COLUMNS.all)}
		`;
		const actor = data[0];
		log.debug('[createAccountActor] created actor', actor);
		return actor;
	}

	async createHubActor(name: string, hub_id: HubId): Promise<PublicActor> {
		const data = await this.sql<PublicActor[]>`
			INSERT INTO actors (type, name, hub_id) VALUES (
				'community', ${name}, ${hub_id}
			) RETURNING ${this.sql(ACTOR_COLUMNS.public)}
		`;
		const actor = data[0];
		log.debug('[createHubActor] created actor', actor);
		return actor;
	}

	async createGhostActor(): Promise<PublicActor> {
		const data = await this.sql<PublicActor[]>`
			INSERT INTO actors (type, name) VALUES (
				'ghost', ${GHOST_ACTOR_NAME}
			) RETURNING ${this.sql(ACTOR_COLUMNS.public)}
		`;
		return data[0];
	}

	async deleteById(actor_id: ActorId): Promise<void> {
		const data = await this.sql`
			DELETE FROM actors
			WHERE actor_id=${actor_id}
		`;
		if (!data.count) throw Error();
	}

	async filterByAccount<T extends ActorColumn>(
		account_id: AccountId,
		columns: T[],
	): Promise<Array<Pick<AccountActor, T>>> {
		log.debug('[filterByAccount]', account_id);
		const data = await this.sql<Array<Pick<AccountActor, T>>>`
			SELECT ${this.sql(columns as string[])}
			FROM actors
			WHERE account_id=${account_id}
		`;
		return data;
	}

	async filterAssociatesByAccount<T extends ActorColumn>(
		account_id: AccountId,
		columns: T[],
	): Promise<Array<Pick<ActorRecord, T>>> {
		const data = await this.sql<Array<Pick<ActorRecord, T>>>`
			SELECT ${this.sql(columns.map((c) => 'p3.' + c))}
			FROM actors p3
			JOIN (SELECT DISTINCT actor_id FROM assignments a2
				JOIN (SELECT DISTINCT a.hub_id FROM assignments a
					JOIN (SELECT * FROM actors WHERE account_id=${account_id}) p
					ON p.actor_id=a.actor_id) c
				ON a2.hub_id=c.hub_id) p2
			ON p3.actor_id=p2.actor_id
			UNION
			SELECT ${this.sql(columns as string[])}
			FROM actors
			WHERE actor_id=${ADMIN_ACTOR_ID} OR actor_id=${GHOST_ACTOR_ID}
		`;
		return data;
	}

	async findById<T extends ActorColumn>(
		actor_id: ActorId,
		columns: T[],
	): Promise<Pick<ActorRecord, T> | undefined> {
		log.debug('[findById]', actor_id);
		const data = await this.sql<Array<Pick<ActorRecord, T>>>`
			SELECT ${this.sql(columns as string[])}
			FROM actors WHERE actor_id=${actor_id}
		`;
		return data[0];
	}

	// TODO handle count mismatch similar to to the entity version of this method
	async filterByIds<T extends ActorColumn>(
		actorIds: ActorId[],
		columns: T[],
	): Promise<{actors: Array<Pick<ActorRecord, T>>; missing: null | ActorId[]}> {
		if (actorIds.length === 0) return {actors: [], missing: null};
		const actors = await this.sql<Array<Pick<ActorRecord, T>>>`
			SELECT ${this.sql(columns as string[])}
			FROM actors WHERE actor_id IN ${this.sql(actorIds)}
		`;
		const missing =
			actors.length === actorIds.length
				? null
				: actorIds.filter(
						(id) => !actors.some((e) => (e as Pick<ActorRecord, 'actor_id'>).actor_id === id), // TODO try to remove the cast to `as Pick<Actor, 'actor_id'>`
					);
		return {actors, missing};
	}

	async findByHub<T extends ActorColumn>(
		hub_id: HubId,
		columns: T[],
	): Promise<Pick<ActorRecord, T> | undefined> {
		log.debug('[findByHub]', hub_id);
		const data = await this.sql<Array<Pick<ActorRecord, T>>>`
			SELECT ${this.sql(columns as string[])}
			FROM actors WHERE hub_id=${hub_id}
		`;
		return data[0];
	}

	async findByName<T extends ActorColumn>(
		name: string,
		columns: T[],
	): Promise<Pick<ActorRecord, T> | undefined> {
		log.debug('[findByName]', name);
		const data = await this.sql<Array<Pick<ActorRecord, T>>>`
			SELECT ${this.sql(columns as string[])}
			FROM actors WHERE LOWER(name)=${name.toLowerCase()}
		`;
		return data[0];
	}

	async filterHubActorsByAccount(
		account_id: AccountId,
	): Promise<Array<{hub_id: HubId; actor_id: ActorId}>> {
		const data = await this.sql<[{hub_id: HubId; actor_id: ActorId}]>`		
			SELECT DISTINCT a.hub_id, act.actor_id
			FROM actors act
			JOIN assignments a
			ON act.actor_id=a.actor_id AND act.account_id=${account_id}
		`;
		return data;
	}

	async filterAssociatesByHub<T extends ActorColumn>(
		hub_id: HubId,
		columns: T[],
	): Promise<Array<Pick<ActorRecord, T>>> {
		const data = await this.sql<Array<Pick<ActorRecord, T>>>`
		SELECT ${this.sql(columns.map((c) => 'act.' + c))}
			FROM actors act
			JOIN (
				SELECT DISTINCT actor_id FROM assignments
				WHERE hub_id=${hub_id}
			) a
			ON act.actor_id=a.actor_id			
		`;
		return data;
	}
}
