import {NOT_OK, OK, type Result} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Role} from '$lib/vocab/role/role';

const log = new Logger(gray('[') + blue('RoleRepo') + gray(']'));

export class RoleRepo extends PostgresRepo {
	async findById(role_id: number): Promise<Result<{value: Role}>> {
		log.trace('[findById]', role_id);
		const result = await this.sql<Role[]>`
			SELECT role_id, hub_id, name, created, updated 
			FROM roles WHERE role_id=${role_id}
		`;
		return {ok: true, value: result[0]};
	}

	async findByPolicy(policy_id: number): Promise<Result<{value: Role}>> {
		log.trace('[findByPolicy]', policy_id);
		const result = await this.sql<Role[]>`
			SELECT r.role_id, r.hub_id, r.name, r.created, r.updated 
			FROM roles r JOIN
			policies p
			ON p.role_id=r.role_id AND p.policy_id=${policy_id};
		`;
		return {ok: true, value: result[0]};
	}

	async filterByHub(hub_id: number): Promise<Result<{value: Role[]}>> {
		log.trace('[filterByHub]', hub_id);
		const result = await this.sql<Role[]>`
			SELECT role_id, hub_id, name, created, updated 
			FROM roles WHERE hub_id=${hub_id}
		`;
		return {ok: true, value: result};
	}

	async create(hub_id: number, name: string): Promise<Result<{value: Role}>> {
		log.trace('[create]', hub_id, name);
		const result = await this.sql<Role[]>`
    INSERT INTO roles (hub_id, name) VALUES (
      ${hub_id}, ${name}
    ) RETURNING *
  `;
		if (!result.length) return NOT_OK;
		return {ok: true, value: result[0]};
	}

	async update(role_id: number, name: string): Promise<Result<{value: Role}>> {
		const result = await this.sql<Role[]>`
			UPDATE roles SET updated=NOW(), name=${name} WHERE role_id=${role_id}
			RETURNING *
		`;
		if (!result.count) return NOT_OK;
		return {ok: true, value: result[0]};
	}

	async deleteById(role_id: number): Promise<Result> {
		log.trace('[deleteById]', role_id);
		const result = await this.sql<any[]>`
			DELETE FROM roles WHERE role_id=${role_id}
		`;
		if (!result.count) return NOT_OK;
		return OK;
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Role[]}>> {
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
		return {ok: true, value: result};
	}
}
