import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Space, SpaceId} from '$lib/vocab/space/space';
import type {HubId} from '$lib/vocab/hub/hub';
import type {EntityId} from '$lib/vocab/entity/entity';
import type {AccountId} from '$lib/vocab/account/account';

const log = new Logger(gray('[') + blue('SpaceRepo') + gray(']'));

export class SpaceRepo extends PostgresRepo {
	async findById(space_id: SpaceId): Promise<Space | undefined> {
		log.debug(`[findById] ${space_id}`);
		const data = await this.sql<Space[]>`
			SELECT space_id, name, icon, view, updated, created, hub_id, directory_id
			FROM spaces WHERE space_id=${space_id}
		`;
		log.debug('[findById] result', data);
		return data[0];
	}

	async filterByAccount(account_id: AccountId): Promise<Space[]> {
		log.debug('[filterByAccount]', account_id);
		const data = await this.sql<Space[]>`
			SELECT s.space_id, s.name, icon, s.view, s.updated, s.created, s.hub_id, s.directory_id
			FROM spaces s JOIN (
				SELECT DISTINCT a.hub_id FROM actors p
				JOIN assignments a ON p.actor_id=a.actor_id AND p.account_id=${account_id}
			) apc
			ON s.hub_id=apc.hub_id;
		`;
		return data;
	}

	async filterByHub(hub_id: HubId): Promise<Space[]> {
		log.debug('[filterByHub]', hub_id);
		const data = await this.sql<Space[]>`
			SELECT space_id, name, icon, view, updated, created, hub_id, directory_id
			FROM spaces WHERE hub_id=${hub_id}
		`;
		return data;
	}

	async create(
		name: string,
		view: string,
		icon: string,
		hub_id: HubId,
		directory_id: EntityId,
	): Promise<Space> {
		const data = await this.sql<Space[]>`
			INSERT INTO spaces (name, icon, view, hub_id, directory_id) VALUES (
				${name},${icon},${view},${hub_id}, ${directory_id}
			) RETURNING *
		`;
		return data[0];
	}

	async update(
		space_id: SpaceId,
		partial: Partial<Pick<Space, 'name' | 'icon' | 'view'>>,
	): Promise<Space> {
		log.debug(`updating data for space: ${space_id}`);
		const data = await this.sql<Space[]>`
			UPDATE spaces
			SET updated=NOW(), ${this.sql(partial as any, ...Object.keys(partial))}
			WHERE space_id= ${space_id}
			RETURNING *
		`;
		if (!data.count) throw Error('no space found');
		return data[0];
	}

	async deleteById(space_id: SpaceId): Promise<void> {
		log.debug('[deleteById]', space_id);
		const data = await this.sql<any[]>`
			DELETE FROM spaces WHERE space_id=${space_id}
		`;
		if (!data.count) throw Error('no space found');
	}

	async findByEntity(entity_id: EntityId): Promise<Space> {
		log.debug(`[findByEntity] ${entity_id}`);
		const data = await this.sql<Space[]>`
				SELECT s.space_id, s.name, s.icon, s.view, s.updated, s.created, s.hub_id, s.directory_id 
				FROM spaces s
				JOIN entities e
				ON s.space_id = e.space_id AND e.entity_id = ${entity_id}			
		`;
		if (!data.length) throw Error('no space found');
		return data[0];
	}

	/**
	 * Given an input array of entity ids, return the set of spaces they belong to
	 * @param entityIds - array of entity ids you want to find owning spaces of
	 * @returns The distinct set of spaces containing the provided entities
	 */
	async filterByEntities(entityIds: number[]): Promise<Space[]> {
		log.debug(`[filterByEntities] ${entityIds}`);
		const data = await this.sql<Space[]>`
				SELECT DISTINCT s.space_id, s.name, s.icon, s.view, s.updated, s.created, s.hub_id, s.directory_id 
				FROM spaces s
				JOIN entities e
				ON s.space_id = e.space_id AND e.entity_id IN ${this.sql(entityIds)}			
		`;
		if (!data.length) throw Error('no space found');
		return data;
	}
}
