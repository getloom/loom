import {NOT_OK, OK, type Result} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Space} from '$lib/vocab/space/space.js';

const log = new Logger(gray('[') + blue('SpaceRepo') + gray(']'));

export class SpaceRepo extends PostgresRepo {
	async findById(space_id: number): Promise<Result<{value: Space | undefined}>> {
		log.trace(`[findById] ${space_id}`);
		const data = await this.sql<Space[]>`
			SELECT space_id, name, icon, view, updated, created, hub_id, directory_id
			FROM spaces WHERE space_id=${space_id}
		`;
		log.trace('[findById] result', data);
		return {ok: true, value: data[0]};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Space[]}>> {
		log.trace('[filterByAccount]', account_id);
		const data = await this.sql<Space[]>`
			SELECT s.space_id, s.name, icon, s.view, s.updated, s.created, s.hub_id, s.directory_id
			FROM spaces s JOIN (
				SELECT DISTINCT a.hub_id FROM personas p
				JOIN assignments a ON p.persona_id=a.persona_id AND p.account_id=${account_id}
			) apc
			ON s.hub_id=apc.hub_id;
		`;
		return {ok: true, value: data};
	}

	async filterByHub(hub_id: number): Promise<Result<{value: Space[]}>> {
		log.trace('[filterByHub]', hub_id);
		const data = await this.sql<Space[]>`
			SELECT space_id, name, icon, view, updated, created, hub_id, directory_id
			FROM spaces WHERE hub_id=${hub_id}
		`;
		return {ok: true, value: data};
	}

	async create(
		name: string,
		view: string,
		icon: string,
		hub_id: number,
		directory_id: number,
	): Promise<Result<{value: Space}>> {
		const data = await this.sql<Space[]>`
			INSERT INTO spaces (name, icon, view, hub_id, directory_id) VALUES (
				${name},${icon},${view},${hub_id}, ${directory_id}
			) RETURNING *
		`;
		return {ok: true, value: data[0]};
	}

	async update(
		space_id: number,
		partial: Partial<Pick<Space, 'name' | 'icon' | 'view'>>,
	): Promise<Result<{value: Space}>> {
		log.trace(`updating data for space: ${space_id}`);
		const data = await this.sql<Space[]>`
			UPDATE spaces
			SET updated=NOW(), ${this.sql(partial as any, ...Object.keys(partial))}
			WHERE space_id= ${space_id}
			RETURNING *
		`;
		if (!data.count) return NOT_OK;
		return {ok: true, value: data[0]};
	}

	async deleteById(space_id: number): Promise<Result> {
		log.trace('[deleteById]', space_id);
		const data = await this.sql<any[]>`
			DELETE FROM spaces WHERE space_id=${space_id}
		`;
		if (!data.count) return NOT_OK;
		return OK;
	}

	async findByEntity(entity_id: number): Promise<Result<{value: Space}>> {
		log.trace(`[findByEntity] ${entity_id}`);
		const data = await this.sql<Space[]>`
				SELECT s.space_id, s.name, s.icon, s.view, s.updated, s.created, s.hub_id, s.directory_id 
				FROM spaces s
				JOIN entities e
				ON s.space_id = e.space_id AND e.entity_id = ${entity_id}			
		`;
		if (!data.length) return NOT_OK;
		return {ok: true, value: data[0]};
	}
}
