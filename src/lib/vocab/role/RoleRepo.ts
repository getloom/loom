import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Role, RoleId} from '$lib/vocab/role/role';
import type {PolicyId} from '$lib/vocab/policy/policy';
import type {HubId} from '$lib/vocab/hub/hub';
import type {AccountId} from '$lib/vocab/account/account';

const log = new Logger(gray('[') + blue('RoleRepo') + gray(']'));

export class RoleRepo extends PostgresRepo {
	async findById(role_id: RoleId): Promise<Role> {
		log.debug('[findById]', role_id);
		const result = await this.sql<Role[]>`
			SELECT role_id, hub_id, name, created, updated 
			FROM roles WHERE role_id=${role_id}
		`;
		return result[0];
	}

	async findByPolicy(policy_id: PolicyId): Promise<Role> {
		log.debug('[findByPolicy]', policy_id);
		const result = await this.sql<Role[]>`
			SELECT r.role_id, r.hub_id, r.name, r.created, r.updated 
			FROM roles r JOIN
			policies p
			ON p.role_id=r.role_id AND p.policy_id=${policy_id};
		`;
		return result[0];
	}

	async filterByHub(hub_id: HubId): Promise<Role[]> {
		log.debug('[filterByHub]', hub_id);
		const result = await this.sql<Role[]>`
			SELECT role_id, hub_id, name, created, updated 
			FROM roles WHERE hub_id=${hub_id}
		`;
		return result;
	}

	async create(hub_id: HubId, name: string): Promise<Role> {
		log.debug('[create]', hub_id, name);
		const result = await this.sql<Role[]>`
    INSERT INTO roles (hub_id, name) VALUES (
      ${hub_id}, ${name}
    ) RETURNING *
  `;
		return result[0];
	}

	async update(role_id: RoleId, name: string): Promise<Role> {
		const result = await this.sql<Role[]>`
			UPDATE roles SET updated=NOW(), name=${name} WHERE role_id=${role_id}
			RETURNING *
		`;
		if (!result.count) throw Error('no role found');
		return result[0];
	}

	async deleteById(role_id: RoleId): Promise<void> {
		log.debug('[deleteById]', role_id);
		const result = await this.sql<any[]>`
			DELETE FROM roles WHERE role_id=${role_id}
		`;
		if (!result.count) throw Error('no role found');
	}

	async filterByAccount(account_id: AccountId): Promise<Role[]> {
		log.debug('[filterByAccount]', account_id);
		const result = await this.sql<Role[]>`
			SELECT r.role_id, r.hub_id, r.name, r.created, r.updated							
			FROM roles r JOIN (
				SELECT DISTINCT a.hub_id FROM personas p
				JOIN assignments a ON p.persona_id=a.persona_id AND p.account_id=${account_id}
			) apc
			ON r.hub_id=apc.hub_id;
		`;
		log.debug('[filterByAccount]', result.length);
		return result;
	}
}
