import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import {PostgresRepo} from '$lib/db/PostgresRepo.js';
import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
import type {Directory, EntityData} from '$lib/vocab/entity/entityData.js';
import {GHOST_ACTOR_ID} from '$lib/util/constants.js';
import type {ActorId} from '$lib/vocab/actor/actor.js';
import type {SpaceId} from '$lib/vocab/space/space.js';
import type {HubId} from '$lib/vocab/hub/hub.js';
import type {AccountId} from '$lib/vocab/account/account.js';
import {ENTITY_COLUMNS, type EntityColumn} from '$lib/vocab/entity/entityHelpers.server.js';

const log = new Logger(gray('[') + blue('EntityRepo') + gray(']'));

export class EntityRepo extends PostgresRepo {
	/**
	 * Creates an entity.
	 * @param actor_id
	 * @param space_id
	 * @param hub_id
	 * @param data
	 * @param directory_id - When `null`, creates a directory, so `entity_id === directory_id`.
	 * @param path
	 */
	async create(
		actor_id: ActorId,
		space_id: SpaceId,
		hub_id: HubId,
		data: EntityData,
		directory_id: EntityId | null = null,
		path: string | null = null,
	): Promise<Entity> {
		log.debug('[createEntity]', actor_id);
		const entity = await this.sql<Entity[]>`
			INSERT INTO entities (actor_id, space_id, directory_id, hub_id, path, data) VALUES (
				${actor_id}, ${space_id}, ${
					directory_id ?? this.sql.unsafe("CURRVAL('items_item_id_seq')")
				}, ${hub_id}, ${path}, ${this.sql.json(data as any)}
			) RETURNING *
		`;
		return entity[0];
	}

	async findById(entity_id: EntityId): Promise<Entity | undefined> {
		const data = await this.sql<Entity[]>`
			SELECT entity_id, actor_id, space_id, directory_id, hub_id, path, data, created, updated
			FROM entities WHERE entity_id=${entity_id}
		`;
		return data[0];
	}

	/**
	 * Finds the directory in a given hub with the given path.
	 * If it returns nothing, no other directories in the hub share that path.
	 *
	 * @param hub_id - the hub to search for directories
	 * @param path - the path to match
	 * @returns the matching directory, if any
	 */
	async findDirectoryByHubPath(hub_id: HubId, path: string): Promise<Entity | undefined> {
		log.debug('[findDirectoryByHubPath]', hub_id, path);
		const data = await this.sql<Entity[]>`
			SELECT entity_id, actor_id, space_id, directory_id, hub_id, path, data, created, updated
			FROM entities
			WHERE entity_id=directory_id AND hub_id=${hub_id} AND path=${path}
		`;
		log.debug('[findDirectoryByHubPath] result', data);
		return data[0];
	}

	/**
	 * Finds any entities in a given space that might also have the given path.
	 * If it returns nothing, no other entities in the space share that path.
	 * @param space_id - the space to search for entities
	 * @param path - the path to match
	 * @returns the matching entity, if any
	 */
	async findBySpacePath(space_id: SpaceId, path: string): Promise<Entity | undefined> {
		log.debug('[findBySpacePath]', space_id, path);
		const data = await this.sql<Entity[]>`
			SELECT entity_id, actor_id, space_id, directory_id, hub_id, path, data, created, updated
			FROM entities
			WHERE space_id=${space_id} AND path=${path}
		`;
		log.debug('[findBySpacePath] result', data);
		return data[0];
	}

	// TODO maybe `EntityQuery`?
	// TODO remove the `message`, handle count mismatch similar to `findById` calls, maybe returning an array of the missing ids with `ok: false`
	async filterByIds(
		entityIds: EntityId[],
		orderBy: 'newest' | 'oldest' = 'newest',
	): Promise<{entities: Entity[]; missing: null | EntityId[]}> {
		if (entityIds.length === 0) return {entities: [], missing: null};
		log.debug('[filterByIds]', entityIds);
		const entities = await this.sql<Entity[]>`
			SELECT entity_id, actor_id, space_id, directory_id, hub_id, path, data, created, updated 
			FROM entities WHERE entity_id IN ${this.sql(entityIds)}
			ORDER BY entity_id ${orderBy === 'newest' ? this.sql`DESC` : this.sql`ASC`}
		`;
		const missing =
			entities.length === entityIds.length
				? null
				: entityIds.filter((id) => !entities.some((e) => e.entity_id === id));
		return {entities, missing};
	}

	async filterDirectoriesByAccount(account_id: AccountId): Promise<Directory[]> {
		const data = await this.sql<Directory[]>`
			SELECT e.entity_id, e.actor_id, e.space_id, e.directory_id, e.hub_id, e.path, e.data, e.created, e.updated
			FROM entities e JOIN (
				SELECT DISTINCT a.hub_id FROM actors p
				JOIN assignments a ON p.actor_id=a.actor_id AND p.account_id=${account_id}
			) c ON c.hub_id=e.hub_id
			WHERE entity_id=directory_id AND e.hub_id=c.hub_id
		`;
		return data;
	}

	async update(
		entity_id: EntityId,
		data?: EntityData,
		path?: string | null | undefined, // value is nullable in the db
	): Promise<Entity> {
		log.debug('[update]', entity_id);
		const _data = await this.sql<Entity[]>`
			UPDATE entities SET
				${data ? this.sql`data=${this.sql.json(data as any)},` : this.sql``}
				${path !== undefined ? this.sql`path=${path},` : this.sql``}
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
		const data = await this.sql<Entity[]>`
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
		const data = await this.sql<Entity[]>`
			DELETE FROM entities
			WHERE entity_id IN ${this.sql(entityIds)}
			RETURNING *
		`;
		if (!data.count) throw Error();
		return data;
	}

	// TODO needs to handle `data.attributedTo` and other data properties containing actors,
	// if possible in the same SQL statement --
	// if `data.attributedTo` exists, replace with `GHOST_ACTOR_ID`
	// how? see https://www.postgresql.org/docs/current/functions-json.html
	// `WHERE data ? 'attributedTo'`
	// `jsonb_set` or  `jsonb_set_lax` with `'delete_key'` maybe
	async attributeToGhostByActor(actor_id: ActorId): Promise<number> {
		log.debug('[ghost]', actor_id);
		const data = await this.sql`
			UPDATE entities
			SET updated=NOW(), actor_id=${GHOST_ACTOR_ID}
			WHERE actor_id=${actor_id};
		`;
		return data.count;
	}

	//This function finds all non-directory entities with no ties pointing to them & returns an array of their ids
	async filterOrphanedEntities(): Promise<Array<Pick<Entity, 'entity_id'>>> {
		const data = await this.sql<Array<Pick<Entity, 'entity_id'>>>`
			SELECT entity_id FROM entities e
			LEFT JOIN ties t
			ON e.entity_id = t.dest_id
			WHERE NOT (e.entity_id=e.directory_id) AND t.dest_id IS NULL;
		`;
		return data;
	}

	async filterDirectoriesByEntity<T extends EntityColumn>(
		entity_id: EntityId,
		columns: T[] = ENTITY_COLUMNS.all as T[],
	): Promise<Array<Pick<Entity, T>>> {
		log.debug(`looking for directories for entity: ${entity_id}`);
		const directories = await this.sql<Array<Pick<Entity, T>>>`
			SELECT DISTINCT ${this.sql(columns.map((e) => 'e.' + e))}
			FROM entities e
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
			WHERE e.entity_id=e.directory_id;
		`;
		log.debug('all directories pointing at entity', entity_id, directories);
		return directories;
	}

	async filterDirectoriesByHub(hub_id: HubId): Promise<Directory[]> {
		const data = await this.sql<Directory[]>`
			SELECT entity_id, actor_id, space_id, directory_id, hub_id, path, data, created, updated
			FROM entities
			WHERE hub_id=${hub_id}
		`;
		return data;
	}
}
