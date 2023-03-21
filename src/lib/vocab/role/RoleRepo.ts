import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Role} from '$lib/vocab/role/role';

const log = new Logger(gray('[') + blue('RoleRepo') + gray(']'));

export class RoleRepo extends PostgresRepo {
	async findById(role_id: number): Promise<Role> {
		log.trace('[findById]', role_id);
		const result = await this.sql<Role[]>`
			SELECT role_id, hub_id, name, created, updated 
			FROM roles WHERE role_id=${role_id}
		`;
		return result[0];
	}

	async findByPolicy(policy_id: number): Promise<Role> {
		log.trace('[findByPolicy]', policy_id);
		const result = await this.sql<Role[]>`
			SELECT r.role_id, r.hub_id, r.name, r.created, r.updated 
			FROM roles r JOIN
			policies p
			ON p.role_id=r.role_id AND p.policy_id=${policy_id};
		`;
		return result[0];
	}

	async filterByHub(hub_id: number): Promise<Role[]> {
		log.trace('[filterByHub]', hub_id);
		const result = await this.sql<Role[]>`
			SELECT role_id, hub_id, name, created, updated 
			FROM roles WHERE hub_id=${hub_id}
		`;
		return result;
	}

	async create(hub_id: number, name: string): Promise<Role> {
		log.trace('[create]', hub_id, name);
		const result = await this.sql<Role[]>`
    INSERT INTO roles (hub_id, name) VALUES (
      ${hub_id}, ${name}
    ) RETURNING *
  `;
		return result[0];
	}

	async update(role_id: number, name: string): Promise<Role> {
		const result = await this.sql<Role[]>`
			UPDATE roles SET updated=NOW(), name=${name} WHERE role_id=${role_id}
			RETURNING *
		`;
		if (!result.count) throw Error('no role found');
		return result[0];
	}

	async deleteById(role_id: number): Promise<void> {
		log.trace('[deleteById]', role_id);
		const result = await this.sql<any[]>`
			DELETE FROM roles WHERE role_id=${role_id}
		`;
		if (!result.count) throw Error('no role found');
	}

	async filterByAccount(account_id: number): Promise<Role[]> {
		log.trace('[filterByAccount]', account_id);
		const result = await this.sql<Role[]>`
			SELECT r.role_id, r.hub_id, r.name, r.created, r.updated							
			FROM roles r JOIN (
				SELECT DISTINCT a.hub_id FROM personas p
				JOIN assignments a ON p.persona_id=a.persona_id AND p.account_id=${account_id}
			) apc
			ON r.hub_id=apc.hub_id;
		`;
		log.trace('[filterByAccount]', result.length);
		return result;
	}
}
