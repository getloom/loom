import {NOT_OK, OK, type Result} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Space} from '$lib/vocab/space/space.js';

const log = new Logger(gray('[') + blue('SpaceRepo') + gray(']'));

export class SpaceRepo extends PostgresRepo {
	async findById(space_id: number): Promise<Result<{value: Space | undefined}>> {
		log.trace(`[findById] ${space_id}`);
		const data = await this.sql<Space[]>`
			SELECT space_id, name, path, icon, view, updated, created, community_id, directory_id
			FROM spaces WHERE space_id=${space_id}
		`;
		log.trace('[findById] result', data);
		return {ok: true, value: data[0]};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Space[]}>> {
		log.trace('[filterByAccount]', account_id);
		const data = await this.sql<Space[]>`
			SELECT s.space_id, s.name, s.path, icon, s.view, s.updated, s.created, s.community_id, s.directory_id
			FROM spaces s JOIN (
				SELECT DISTINCT a.community_id FROM personas p
				JOIN assignments a ON p.persona_id=a.persona_id AND p.account_id=${account_id}
			) apc
			ON s.community_id=apc.community_id;
		`;
		return {ok: true, value: data};
	}

	async filterByCommunity(community_id: number): Promise<Result<{value: Space[]}>> {
		log.trace('[filterByCommunity]', community_id);
		const data = await this.sql<Space[]>`
			SELECT space_id, name, path, icon, view, updated, created, community_id, directory_id
			FROM spaces WHERE community_id=${community_id}
		`;
		return {ok: true, value: data};
	}

	async findByCommunityUrl(
		community_id: number,
		path: string,
	): Promise<Result<{value: Space | undefined}>> {
		log.trace('[findByCommunityUrl]', community_id, path);
		const data = await this.sql<Space[]>`
			SELECT space_id, name, path, icon, view, updated, created, community_id, directory_id
			FROM spaces WHERE community_id=${community_id} AND path=${path}
		`;
		log.trace('[findByCommunityUrl] result', data);
		return {ok: true, value: data[0]};
	}

	async create(
		name: string,
		view: string,
		path: string,
		icon: string,
		community_id: number,
		directory_id: number,
	): Promise<Result<{value: Space}>> {
		const data = await this.sql<Space[]>`
			INSERT INTO spaces (name, path, icon, view, community_id, directory_id) VALUES (
				${name},${path},${icon},${view},${community_id}, ${directory_id}
			) RETURNING *
		`;
		return {ok: true, value: data[0]};
	}

	async update(
		space_id: number,
		partial: Partial<Pick<Space, 'name' | 'path' | 'icon' | 'view'>>,
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
}
