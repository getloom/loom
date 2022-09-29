import {NOT_OK, OK, type Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Role} from '$lib/vocab/role/role';

const log = new Logger(gray('[') + blue('RoleRepo') + gray(']'));

export class RoleRepo extends PostgresRepo {
	async filterByCommunityId(community_id: number): Promise<Result<{value: Role[]}>> {
		log.trace('[filterByCommunityId]', community_id);
		const result = await this.sql<Role[]>`
			SELECT role_id, community_id, name, created, updated 
			FROM roles WHERE community_id=${community_id}
		`;
		return {ok: true, value: result};
	}

	async createRole(community_id: number, name: string): Promise<Result<{value: Role}>> {
		log.trace('[createRole]', community_id, name);
		const result = await this.sql<Role[]>`
    INSERT INTO roles (community_id, name) VALUES (
      ${community_id}, ${name}
    ) RETURNING *
  `;
		if (!result.length) return NOT_OK;
		return {ok: true, value: result[0]};
	}

	async updateRole(role_id: number, name: string): Promise<Result<{value: Role}>> {
		const result = await this.sql<Role[]>`
			UPDATE roles SET name=${name} WHERE role_id=${role_id}
			RETURNING *
		`;
		if (!result.count) return NOT_OK;
		return {ok: true, value: result[0]};
	}

	async deleteByIds(roleIds: number[]): Promise<Result> {
		log.trace('[deleteByIds]', roleIds);
		const result = await this.sql<any[]>`
			DELETE FROM roles WHERE role_id IN ${this.sql(roleIds)}
		`;
		if (result.count !== roleIds.length) return NOT_OK;
		return OK;
	}
}
