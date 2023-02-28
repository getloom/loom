import {NOT_OK, OK, unwrap, type Assignable, type Result} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Hub, HubSettings} from '$lib/vocab/hub/hub';
import {ADMIN_HUB_ID} from '$lib/app/constants';

const log = new Logger(gray('[') + blue('HubRepo') + gray(']'));

export class HubRepo extends PostgresRepo {
	async create(
		type: Hub['type'],
		name: string,
		settings: HubSettings,
	): Promise<Result<{value: Hub}>> {
		const data = await this.sql<Hub[]>`
			INSERT INTO hubs (type, name, settings) VALUES (
				${type}, ${name}, ${this.sql.json(settings as any)}
			) RETURNING *
		`;
		log.trace('[db] created hub', data[0]);
		const hub = data[0];
		return {ok: true, value: hub};
	}

	async findById(hub_id: number): Promise<Result<{value: Hub | undefined}>> {
		log.trace(`[findById] ${hub_id}`);
		const data = await this.sql<Hub[]>`
			SELECT hub_id, type, name, settings, created, updated
			FROM hubs WHERE hub_id=${hub_id}
		`;
		return {ok: true, value: data[0]};
	}

	async findByName(name: string): Promise<Result<{value: Hub | undefined}>> {
		log.trace('[findByName]', name);
		const data = await this.sql<Hub[]>`
			SELECT hub_id, type, name, settings, created, updated
			FROM hubs WHERE LOWER(name) = LOWER(${name})
		`;
		return {ok: true, value: data[0]};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Hub[]}>> {
		log.trace(`[filterByAccount] ${account_id}`);
		const data = await this.sql<Hub[]>`
			SELECT c.hub_id, c.type, c.name, c.settings, c.created, c.updated							
			FROM hubs c JOIN (
				SELECT DISTINCT a.hub_id FROM personas p
				JOIN assignments a ON p.persona_id=a.persona_id AND p.account_id=${account_id}
			) apc
			ON c.hub_id=apc.hub_id;
		`;
		log.trace('[filterByAccount]', data.length);
		return {ok: true, value: data};
	}

	async filterByPersona(persona_id: number): Promise<Result<{value: Hub[]}>> {
		const data = await this.sql<Hub[]>`
			SELECT c.hub_id, c.type, c.name, c.settings, c.created, c.updated
			FROM hubs c JOIN (
				SELECT DISTINCT hub_id FROM assignments
				WHERE persona_id=${persona_id}
			) ac
			ON c.hub_id=ac.hub_id;
		`;
		return {ok: true, value: data};
	}

	async updateSettings(hub_id: number, settings: Hub['settings']): Promise<Result> {
		const data = await this.sql<any[]>`
			UPDATE hubs SET updated=NOW(), settings=${this.sql.json(settings as any)} WHERE hub_id=${hub_id}
		`;
		if (!data.count) return NOT_OK;
		return OK;
	}

	async deleteById(hub_id: number): Promise<Result> {
		log.trace('[deleteById]', hub_id);
		const data = await this.sql<any[]>`
			DELETE FROM hubs WHERE hub_id=${hub_id}
		`;
		if (!data.count) return NOT_OK;
		return OK;
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

	async loadAdminHub(): Promise<Hub> {
		const hub = unwrap(await this.findById(ADMIN_HUB_ID));
		if (!hub) throw Error('unable to load admin hub');
		return hub;
	}

	async findByRole(role_id: number): Promise<Result<{value: Hub}>> {
		log.trace(`[findByRole] ${role_id}`);
		const data = await this.sql<Hub[]>`
			SELECT c.hub_id, c.type, c.name, c.settings, c.created, c.updated
			FROM hubs c 
			JOIN roles r
			ON r.hub_id = c.hub_id
			WHERE r.role_id=${role_id}
		`;
		if (!data.length) return NOT_OK;
		return {ok: true, value: data[0]};
	}
}
