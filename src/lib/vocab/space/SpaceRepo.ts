import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import {PostgresRepo} from '$lib/db/PostgresRepo.js';
import type {Space, SpaceId} from '$lib/vocab/space/space.js';
import type {HubId} from '$lib/vocab/hub/hub.js';
import type {EntityId} from '$lib/vocab/entity/entity.js';
import type {AccountId} from '$lib/vocab/account/account.js';

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

	/**
	 * The space's directory is not yet created at this point,
	 * so it only returns the `space_id` and expects `init` to be called in the same transaction.
	 */
	async create(name: string, icon: string, view: string, hub_id: HubId): Promise<Space> {
		const data = await this.sql<Space[]>`
			INSERT INTO spaces (name, icon, view, hub_id) VALUES (
				${name}, ${icon}, ${view}, ${hub_id}
			) RETURNING space_id
		`;
		return data[0];
	}

	/**
	 * Sets the directory for a newly created space.
	 * To create a space, first call `create` and then `init` in the same transaction.
	 */
	async init(space_id: SpaceId, directory_id: EntityId): Promise<Space> {
		log.debug(`updating data for space: ${space_id}`);
		const data = await this.sql<Space[]>`
			UPDATE spaces
			SET updated=NOW(), directory_id=${directory_id}
			WHERE space_id=${space_id}
			RETURNING *
		`;
		if (!data.count) throw Error('no space found');
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
			WHERE space_id=${space_id}
			RETURNING *
		`;
		if (!data.count) throw Error('no space found');
		return data[0];
	}

	async deleteById(space_id: SpaceId): Promise<void> {
		log.debug('[deleteById]', space_id);
		const data = await this.sql`
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

	async deleteByHub(hub_id: HubId): Promise<number> {
		const data = await this.sql`
			DELETE FROM spaces WHERE hub_id=${hub_id}
		`;
		return data.count;
	}
}
