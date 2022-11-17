import {NOT_OK, OK, type Result} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Entity} from '$lib/vocab/entity/entity';
import type {EntityData} from '$lib/vocab/entity/entityData';

const log = new Logger(gray('[') + blue('EntityRepo') + gray(']'));

export class EntityRepo extends PostgresRepo {
	async create(persona_id: number, data: EntityData): Promise<Result<{value: Entity}>> {
		log.trace('[createEntity]', persona_id);
		const entity = await this.sql<Entity[]>`
			INSERT INTO entities (persona_id, data) VALUES (
				${persona_id},${this.sql.json(data as any)}
			) RETURNING *
		`;
		// log.trace('create entity', data);
		return {ok: true, value: entity[0]};
	}

	async findById(entity_id: number): Promise<Result<{value: Entity | undefined}>> {
		const data = await this.sql<Entity[]>`
			SELECT entity_id, data, persona_id, created, updated 
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
			SELECT entity_id, data, persona_id, created, updated 
			FROM entities WHERE entity_id IN ${this.sql(entityIds)}
			ORDER BY entity_id DESC
		`;
		const missing =
			entities.length === entityIds.length
				? null
				: entityIds.filter((id) => !entities.some((e) => e.entity_id === id));
		return {ok: true, value: {entities, missing}};
	}

	async updateEntityData(
		entity_id: number,
		data: EntityData | null,
	): Promise<Result<{value: Entity}>> {
		log.trace('[updateEntityData]', entity_id);
		const _data = await this.sql<Entity[]>`
			UPDATE entities SET ${
				data ? this.sql`data=${this.sql.json(data as any)},` : this.sql``
			} updated=NOW()
			WHERE entity_id=${entity_id} AND NOT (data @> '{"type":"Tombstone"}'::jsonb) AND NOT (data ? 'space_id')
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
			SET data = jsonb_build_object('type','Tombstone','formerType',data->>'type','deleted',NOW())
			WHERE entity_id IN ${this.sql(
				entityIds,
			)} AND NOT (data @> '{"type":"Tombstone"}'::jsonb) AND NOT (data ? 'space_id')
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

	//This function finds all non-directory entities with no ties pointing to them & returns an array of their ids
	async findOrphanedEntities(): Promise<Result<{value: number[]}>> {
		const data = await this.sql<Entity[]>`
			SELECT entity_id FROM entities e
			LEFT JOIN ties t
			ON e.entity_id = t.dest_id
			WHERE NOT (e.data ? 'space_id') AND t.dest_id IS NULL;
		`;
		return {ok: true, value: data.flatMap((e) => e.entity_id)};
	}
}
