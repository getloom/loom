import {NOT_OK, OK, type Result} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData, EntityData} from '$lib/vocab/entity/entityData';
import {GHOST_PERSONA_ID} from '$lib/app/constants';

const log = new Logger(gray('[') + blue('EntityRepo') + gray(']'));

export class EntityRepo extends PostgresRepo {
	async create(
		persona_id: number,
		data: EntityData,
		space_id: number | null,
	): Promise<Result<{value: Entity}>> {
		log.trace('[createEntity]', persona_id);
		const entity = await this.sql<Entity[]>`
			INSERT INTO entities (persona_id, space_id, data) VALUES (
				${persona_id},${space_id},${this.sql.json(data as any)}
			) RETURNING *
		`;
		// log.trace('create entity', data);
		return {ok: true, value: entity[0]};
	}

	async findById(entity_id: number): Promise<Result<{value: Entity | undefined}>> {
		const data = await this.sql<Entity[]>`
			SELECT entity_id, space_id, data, persona_id, created, updated 
			FROM entities WHERE entity_id=${entity_id}
		`;
		return {ok: true, value: data[0]};
	}

	// TODO maybe `EntityQuery`?
	// TODO remove the `message`, handle count mismatch similar to `findById` calls, maybe returning an array of the missing ids with `ok: false`
	async filterByIds(
		entityIds: number[],
	): Promise<Result<{value: {entities: Entity[]; missing: null | number[]}}>> {
		if (entityIds.length === 0) return {ok: true, value: {entities: [], missing: null}};
		log.trace('[filterByIds]', entityIds);
		const entities = await this.sql<Entity[]>`
			SELECT entity_id, space_id, data, persona_id, created, updated 
			FROM entities WHERE entity_id IN ${this.sql(entityIds)}
			ORDER BY entity_id DESC
		`;
		const missing =
			entities.length === entityIds.length
				? null
				: entityIds.filter((id) => !entities.some((e) => e.entity_id === id));
		return {ok: true, value: {entities, missing}};
	}

	async filterDirectoriesByAccount(
		account_id: number,
	): Promise<Result<{value: Array<Entity & {data: DirectoryEntityData}>}>> {
		const data = await this.sql<Array<Entity & {data: DirectoryEntityData}>>`
			SELECT entity_id, data, persona_id, created, updated, space_id
			FROM entities e JOIN (
				SELECT DISTINCT s.directory_id FROM spaces s
				JOIN (
					SELECT DISTINCT a.community_id FROM personas p
					JOIN assignments a ON p.persona_id=a.persona_id AND p.account_id=${account_id}
				) c ON s.community_id=c.community_id
			) es
			ON e.entity_id=es.directory_id
		`;
		return {ok: true, value: data};
	}

	async update(
		entity_id: number,
		data: EntityData | null,
		space_id?: number,
	): Promise<Result<{value: Entity}>> {
		log.trace('[update]', entity_id);
		const _data = await this.sql<Entity[]>`
			UPDATE entities SET 
				${data ? this.sql`data=${this.sql.json(data as any)},` : this.sql``} 
				${space_id ? this.sql`space_id=${space_id},` : this.sql``} 
				updated=NOW()
			WHERE entity_id=${entity_id} AND NOT (data @> '{"type":"Tombstone"}'::jsonb)
			RETURNING *
		`;
		if (!_data.count) return NOT_OK;
		return {ok: true, value: _data[0]};
	}

	//This function is an idempotent soft delete, that leaves behind a Tombstone entity per Activity-Streams spec
	async eraseByIds(entityIds: number[]): Promise<Result<{value: Entity[]}>> {
		log.trace('[eraseById]', entityIds);
		const data = await this.sql<any[]>`
			UPDATE entities
			SET updated=NOW(), data = jsonb_build_object('type','Tombstone','formerType',data->>'type','deleted',NOW())
			WHERE entity_id IN ${this.sql(entityIds)} AND NOT (data @> '{"type":"Tombstone"}'::jsonb)
			RETURNING *;
		`;
		if (!data.count) return NOT_OK;
		return {ok: true, value: data};
	}

	//This function actually deletes the records in the DB
	async deleteByIds(entityIds: number[]): Promise<Result> {
		log.trace('[deleteByIds]', entityIds);
		const data = await this.sql<any[]>`
			DELETE FROM entities WHERE entity_id IN ${this.sql(entityIds)}
		`;
		if (!data.count) return NOT_OK;
		if (data.count !== entityIds.length) return NOT_OK;
		return OK;
	}

	// TODO needs to handle `data.attributedTo` and other data properties containing personas,
	// if possible in the same SQL statement --
	// if `data.attributedTo` exists, replace with `GHOST_PERSONA_ID`
	// how? see https://www.postgresql.org/docs/current/functions-json.html
	// `WHERE data ? 'attributedTo'`
	// `jsonb_set` or  `jsonb_set_lax` with `'delete_key'` maybe
	async attributeToGhostByPersona(persona_id: number): Promise<Result<{value: number}>> {
		log.trace('[ghost]', persona_id);
		const data = await this.sql<any[]>`
			UPDATE entities
			SET updated=NOW(), persona_id=${GHOST_PERSONA_ID}
			WHERE persona_id=${persona_id};
		`;
		return {ok: true, value: data.count};
	}

	//This function finds all non-directory entities with no ties pointing to them & returns an array of their ids
	async filterOrphanedEntities(): Promise<Result<{value: Array<Pick<Entity, 'entity_id'>>}>> {
		const data = await this.sql<Array<Pick<Entity, 'entity_id'>>>`
			SELECT entity_id FROM entities e
			LEFT JOIN ties t
			ON e.entity_id = t.dest_id
			WHERE NOT (e.data ? 'directory') AND t.dest_id IS NULL;
		`;
		return {ok: true, value: data};
	}

	async filterDirectoriesByEntity(entity_id: number): Promise<Result<{value: Entity[]}>> {
		log.trace(`looking for directories for entity: ${entity_id}`);
		const directories = await this.sql<Entity[]>`
			SELECT DISTINCT e.entity_id, e.data, e.persona_id, e.created, e.updated, e.space_id FROM entities e
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
		log.trace('all directories pointing at entity', directories);
		return {ok: true, value: directories};
	}
}
