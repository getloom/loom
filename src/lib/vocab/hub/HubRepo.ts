import type {Assignable} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Hub, HubSettings} from '$lib/vocab/hub/hub';
import {ADMIN_HUB_ID} from '$lib/app/constants';

const log = new Logger(gray('[') + blue('HubRepo') + gray(']'));

export class HubRepo extends PostgresRepo {
	async create(type: Hub['type'], name: string, settings: HubSettings): Promise<Hub> {
		const data = await this.sql<Hub[]>`
			INSERT INTO hubs (type, name, settings) VALUES (
				${type}, ${name}, ${this.sql.json(settings as any)}
			) RETURNING *
		`;
		log.debug('[db] created hub', data[0]);
		const hub = data[0];
		return hub;
	}

	async findById(hub_id: number): Promise<Hub | undefined> {
		log.debug(`[findById] ${hub_id}`);
		const data = await this.sql<Hub[]>`
			SELECT hub_id, type, name, settings, created, updated
			FROM hubs WHERE hub_id=${hub_id}
		`;
		return data[0];
	}

	async findByName(name: string): Promise<Hub | undefined> {
		log.debug('[findByName]', name);
		const data = await this.sql<Hub[]>`
			SELECT hub_id, type, name, settings, created, updated
			FROM hubs WHERE LOWER(name) = LOWER(${name})
		`;
		return data[0];
	}

	async filterByAccount(account_id: number): Promise<Hub[]> {
		log.debug(`[filterByAccount] ${account_id}`);
		const data = await this.sql<Hub[]>`
			SELECT c.hub_id, c.type, c.name, c.settings, c.created, c.updated							
			FROM hubs c JOIN (
				SELECT DISTINCT a.hub_id FROM personas p
				JOIN assignments a ON p.persona_id=a.persona_id AND p.account_id=${account_id}
			) apc
			ON c.hub_id=apc.hub_id;
		`;
		log.debug('[filterByAccount]', data.length);
		return data;
	}

	async filterByPersona(persona_id: number): Promise<Hub[]> {
		const data = await this.sql<Hub[]>`
			SELECT c.hub_id, c.type, c.name, c.settings, c.created, c.updated
			FROM hubs c JOIN (
				SELECT DISTINCT hub_id FROM assignments
				WHERE persona_id=${persona_id}
			) ac
			ON c.hub_id=ac.hub_id;
		`;
		return data;
	}

	async updateSettings(hub_id: number, settings: Hub['settings']): Promise<void> {
		const data = await this.sql<any[]>`
			UPDATE hubs SET updated=NOW(), settings=${this.sql.json(settings as any)} WHERE hub_id=${hub_id}
		`;
		if (!data.count) throw Error('no hub found');
	}

	async deleteById(hub_id: number): Promise<void> {
		log.debug('[deleteById]', hub_id);
		const data = await this.sql<any[]>`
			DELETE FROM hubs WHERE hub_id=${hub_id}
		`;
		if (!data.count) throw Error('no hub found');
	}

	// This seems safe to cache globally except for possibly tests,
	// but they can fix it themselves.
	static readonly hasAdminHub: boolean = false;

	async hasAdminHub(): Promise<boolean> {
		if (HubRepo.hasAdminHub) return true;
		const [{exists}] = await this.sql`
			SELECT EXISTS(SELECT 1 FROM hubs WHERE hub_id=${ADMIN_HUB_ID});
		`;
		if (exists) {
			(HubRepo as Assignable<typeof HubRepo, 'hasAdminHub'>).hasAdminHub = true;
		}
		return exists;
	}

	async loadAdminHub(): Promise<Hub | undefined> {
		return this.findById(ADMIN_HUB_ID);
	}

	async findByRole(role_id: number): Promise<Hub | undefined> {
		log.debug(`[findByRole] ${role_id}`);
		const data = await this.sql<Hub[]>`
			SELECT c.hub_id, c.type, c.name, c.settings, c.created, c.updated
			FROM hubs c 
			JOIN roles r
			ON r.hub_id = c.hub_id
			WHERE r.role_id=${role_id}
		`;
		return data[0];
	}
}
