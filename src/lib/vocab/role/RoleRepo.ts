import {NOT_OK, OK, type Result} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Role} from '$lib/vocab/role/role';

const log = new Logger(gray('[') + blue('RoleRepo') + gray(']'));

export class RoleRepo extends PostgresRepo {
	async findById(role_id: number): Promise<Result<{value: Role}>> {
		log.trace('[findById]', role_id);
		const result = await this.sql<Role[]>`
			SELECT role_id, community_id, name, created, updated 
			FROM roles WHERE role_id=${role_id}
		`;
		return {ok: true, value: result[0]};
	}

	async findByPolicy(policy_id: number): Promise<Result<{value: Role}>> {
		log.trace('[findByPolicy]', policy_id);
		const result = await this.sql<Role[]>`
			SELECT r.role_id, r.community_id, r.name, r.created, r.updated 
			FROM roles r JOIN
			policies p
			ON p.role_id=r.role_id AND p.policy_id=${policy_id};
		`;
		return {ok: true, value: result[0]};
	}

	async filterByCommunity(community_id: number): Promise<Result<{value: Role[]}>> {
		log.trace('[filterByCommunity]', community_id);
		const result = await this.sql<Role[]>`
			SELECT role_id, community_id, name, created, updated 
			FROM roles WHERE community_id=${community_id}
		`;
		return {ok: true, value: result};
	}

	async create(community_id: number, name: string): Promise<Result<{value: Role}>> {
		log.trace('[create]', community_id, name);
		const result = await this.sql<Role[]>`
    INSERT INTO roles (community_id, name) VALUES (
      ${community_id}, ${name}
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
			SELECT r.role_id, r.community_id, r.name, r.created, r.updated							
			FROM roles r JOIN (
				SELECT DISTINCT a.community_id FROM personas p
				JOIN assignments a ON p.persona_id=a.persona_id AND p.account_id=${account_id}
			) apc
			ON r.community_id=apc.community_id;
		`;
		log.trace('[filterByAccount]', result.length);
		return {ok: true, value: result};
	}
}
