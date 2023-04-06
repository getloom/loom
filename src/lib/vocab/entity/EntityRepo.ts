import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Entity, EntityId} from '$lib/vocab/entity/entity';
import type {Directory, EntityData} from '$lib/vocab/entity/entityData';
import {GHOST_ACTOR_ID} from '$lib/app/constants';
import type {ActorId} from '$lib/vocab/actor/actor';
import type {SpaceId} from '$lib/vocab/space/space';
import type {HubId} from '$lib/vocab/hub/hub';
import type {AccountId} from '$lib/vocab/account/account';

const log = new Logger(gray('[') + blue('EntityRepo') + gray(']'));

export class EntityRepo extends PostgresRepo {
	async create(
		persona_id: ActorId,
		data: EntityData,
		space_id: SpaceId | null,
		path: string | null = null,
	): Promise<Entity> {
		log.debug('[createEntity]', persona_id);
		const entity = await this.sql<Entity[]>`
			INSERT INTO entities (persona_id, space_id, path, data) VALUES (
				${persona_id}, ${space_id}, ${path}, ${this.sql.json(data as any)}
			) RETURNING *
		`;
		// log.debug('create entity', data);
		return entity[0];
	}

	async findById(entity_id: EntityId): Promise<Entity | undefined> {
		const data = await this.sql<Entity[]>`
			SELECT entity_id, space_id, path, data, persona_id, created, updated
			FROM entities WHERE entity_id=${entity_id}
		`;
		return data[0];
	}

	async findByPath(hub_id: HubId, path: string): Promise<Entity | undefined> {
		log.debug('[findByPath]', hub_id, path);
		const data = await this.sql<Entity[]>`
			SELECT e.entity_id, e.space_id, e.path, e.data, e.persona_id, e.created, e.updated
			FROM spaces s
			JOIN entities e
			ON s.directory_id=e.entity_id AND e.path=${path}
			WHERE s.hub_id=${hub_id}
		`;
		log.debug('[findByPath] result', data);
		return data[0];
	}

	// TODO maybe `EntityQuery`?
	// TODO remove the `message`, handle count mismatch similar to `findById` calls, maybe returning an array of the missing ids with `ok: false`
	async filterByIds(
		entityIds: EntityId[],
	): Promise<{entities: Entity[]; missing: null | EntityId[]}> {
		if (entityIds.length === 0) return {entities: [], missing: null};
		log.debug('[filterByIds]', entityIds);
		const entities = await this.sql<Entity[]>`
			SELECT entity_id, space_id, path, data, persona_id, created, updated 
			FROM entities WHERE entity_id IN ${this.sql(entityIds)}
			ORDER BY entity_id DESC
		`;
		const missing =
			entities.length === entityIds.length
				? null
				: entityIds.filter((id) => !entities.some((e) => e.entity_id === id));
		return {entities, missing};
	}

	async filterDirectoriesByAccount(account_id: AccountId): Promise<Directory[]> {
		const data = await this.sql<Directory[]>`
			SELECT entity_id, data, persona_id, created, updated, space_id, path
			FROM entities e JOIN (
				SELECT DISTINCT s.directory_id FROM spaces s
				JOIN (
					SELECT DISTINCT a.hub_id FROM personas p
					JOIN assignments a ON p.persona_id=a.persona_id AND p.account_id=${account_id}
				) c ON s.hub_id=c.hub_id
			) es
			ON e.entity_id=es.directory_id
		`;
		return data;
	}

	async update(
		entity_id: EntityId,
		data?: EntityData,
		path?: string | null | undefined, // value is nullable in the db
		space_id?: SpaceId,
	): Promise<Entity> {
		log.debug('[update]', entity_id);
		const _data = await this.sql<Entity[]>`
			UPDATE entities SET
				${data ? this.sql`data=${this.sql.json(data as any)},` : this.sql``}
				${path !== undefined ? this.sql`path=${path},` : this.sql``}
				${space_id ? this.sql`space_id=${space_id},` : this.sql``}
				updated=NOW()
			WHERE entity_id=${entity_id}
			RETURNING *
		`;
		if (!_data.count) throw Error();
		return _data[0];
	}

	//This function is an idempotent soft delete, that leaves behind a Tombstone entity per Activity-Streams spec
	async eraseByIds(entityIds: EntityId[]): Promise<Entity[]> {
		log.debug('[eraseById]', entityIds);
		const data = await this.sql<any[]>`
			UPDATE entities
			SET updated=NOW(), data = jsonb_build_object('type','Tombstone','formerType',data->>'type','deleted',NOW())
			WHERE entity_id IN ${this.sql(entityIds)} AND NOT (data @> '{"type":"Tombstone"}'::jsonb)
			RETURNING *;
		`;
		if (!data.count) throw Error();
		return data;
	}

	//This function actually deletes the records in the DB
	async deleteByIds(entityIds: EntityId[]): Promise<Entity[]> {
		log.debug('[deleteByIds]', entityIds);
		const data = await this.sql<any[]>`
			DELETE FROM entities
			WHERE entity_id IN ${this.sql(entityIds)}
			RETURNING *
		`;
		if (!data.count) throw Error();
		return data;
	}

	// TODO needs to handle `data.attributedTo` and other data properties containing personas,
	// if possible in the same SQL statement --
	// if `data.attributedTo` exists, replace with `GHOST_ACTOR_ID`
	// how? see https://www.postgresql.org/docs/current/functions-json.html
	// `WHERE data ? 'attributedTo'`
	// `jsonb_set` or  `jsonb_set_lax` with `'delete_key'` maybe
	async attributeToGhostByPersona(persona_id: ActorId): Promise<number> {
		log.debug('[ghost]', persona_id);
		const data = await this.sql<any[]>`
			UPDATE entities
			SET updated=NOW(), persona_id=${GHOST_ACTOR_ID}
			WHERE persona_id=${persona_id};
		`;
		return data.count;
	}

	//This function finds all non-directory entities with no ties pointing to them & returns an array of their ids
	async filterOrphanedEntities(): Promise<Array<Pick<Entity, 'entity_id'>>> {
		const data = await this.sql<Array<Pick<Entity, 'entity_id'>>>`
			SELECT entity_id FROM entities e
			LEFT JOIN ties t
			ON e.entity_id = t.dest_id
			WHERE NOT (e.data ? 'directory') AND t.dest_id IS NULL;
		`;
		return data;
	}

	async filterDirectoriesByEntity(entity_id: EntityId): Promise<Entity[]> {
		log.debug(`looking for directories for entity: ${entity_id}`);
		const directories = await this.sql<Entity[]>`
			SELECT DISTINCT e.entity_id, e.data, e.persona_id, e.created, e.updated, e.space_id, e.path FROM entities e
			JOIN (
			WITH RECURSIVE paths (tie_id, source_id, dest_id, type, created, path) AS (
				SELECT t.tie_id, t.source_id, t.dest_id, t.type, t.created, ARRAY[t.source_id, t.dest_id]
					FROM ties t WHERE dest_id=${entity_id}
				UNION ALL
					SELECT t.tie_id, t.source_id, t.dest_id, t.type,t.created, p.path || ARRAY[t.source_id]
					FROM paths p
					JOIN ties t
					ON p.source_id = t.dest_id AND t.source_id != ALL(p.path)
			)
			SELECT DISTINCT tie_id, source_id, dest_id, type, created FROM paths
			) as tdest
			ON e.entity_id = tdest.source_id
			WHERE data ? 'directory';
		`;
		log.debug('all directories pointing at entity', directories);
		return directories;
	}
}
