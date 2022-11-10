import {NOT_OK, OK, type Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Policy} from '$lib/vocab/policy/policy';

const log = new Logger(gray('[') + blue('PolicyRepo') + gray(']'));

export class RoleRepo extends PostgresRepo {
	async filterByPolicyId(policy_id: number): Promise<Result<{value: Policy[]}>> {
		log.trace('[filterByPolicyId]', policy_id);
		const result = await this.sql<Policy[]>`
			SELECT policy_id, role_id, permission, data, created, updated 
			FROM policies WHERE policy_id=${policy_id}
		`;
		return {ok: true, value: result};
	}

	async createPolicy(role_id: number, permission: string): Promise<Result<{value: Policy}>> {
		log.trace('[createPolicy]', role_id, permission);
		const result = await this.sql<Policy[]>`
    INSERT INTO policies (role_id, permission) VALUES (
      ${role_id}, ${permission}
    ) RETURNING *
  `;
		if (!result.length) return NOT_OK;
		return {ok: true, value: result[0]};
	}

	async updatePolicy(policy_id: number, data: object): Promise<Result<{value: Policy}>> {
		const result = await this.sql<Policy[]>`
			UPDATE roles SET data=${this.sql.json(data as any)} WHERE policy_id=${policy_id}
			RETURNING *
		`;
		if (!result.count) return NOT_OK;
		return {ok: true, value: result[0]};
	}

	async deleteById(policy_id: number): Promise<Result> {
		log.trace('[deleteById]', policy_id);
		const result = await this.sql<any[]>`
			DELETE FROM policies WHERE policy_id=${policy_id}
		`;
		if (!result.count) return NOT_OK;
		return OK;
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Policy[]}>> {
		log.trace('[filterByAccountId]', account_id);
		const result = await this.sql<Policy[]>`
		SELECT pol.policy_id, pol.role_id, pol.permission, pol.data, pol.created, pol.updated
		FROM policies pol JOIN (							
				SELECT DISTINCT r.role_id FROM roles r JOIN (
					SELECT DISTINCT a.community_id FROM personas p
					JOIN assignments a ON p.persona_id=a.persona_id AND p.account_id = ${account_id}
				) apc
				ON r.community_id=apc.community_id
		) apcr
		ON pol.role_id = apcr
		`;
		log.trace('[filterByAccount]', result.length);
		return {ok: true, value: result};
	}
}
