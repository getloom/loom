import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {RoleId} from '$lib/vocab/role/role';
import type {Policy, PolicyId, PolicyName} from '$lib/vocab/policy/policy';
import type {HubId} from '$lib/vocab/hub/hub';
import type {AccountId} from '$lib/vocab/account/account';
import type {ActorId} from '$lib/vocab/actor/actor';

const log = new Logger(gray('[') + blue('PolicyRepo') + gray(']'));

export class PolicyRepo extends PostgresRepo {
	async filterByRole(role_id: RoleId): Promise<Policy[]> {
		log.debug('[filterByRole]', role_id);
		const result = await this.sql<Policy[]>`
			SELECT policy_id, role_id, name, data, created, updated 
			FROM policies WHERE role_id=${role_id}
		`;
		return result;
	}

	async filterByActorHubPolicy(
		actor_id: ActorId,
		hub_id: HubId,
		name: PolicyName,
	): Promise<Policy[]> {
		log.debug('[filterByActorHubPolicy]', actor_id, hub_id, name);
		const result = await this.sql<Policy[]>`
		SELECT * FROM policies JOIN
			(SELECT roles.role_id FROM roles JOIN
				(SELECT * FROM assignments WHERE actor_id=${actor_id} AND hub_id=${hub_id}) a
				ON a.role_id = roles.role_id) r
		ON policies.role_id = r.role_id AND name=${name};
		`;
		return result;
	}

	async create(
		role_id: RoleId,
		name: PolicyName,
		data?: object | null | undefined,
	): Promise<Policy> {
		log.debug('[createPolicy]', role_id, name);
		const result = await this.sql<Policy[]>`
    INSERT INTO policies (role_id, name, data) VALUES (
      ${role_id}, ${name}, ${data ? this.sql.json(data as any) : null}
    ) RETURNING *
  `;
		return result[0];
	}

	async update(policy_id: PolicyId, data: object | null | undefined): Promise<Policy> {
		const result = await this.sql<Policy[]>`
			UPDATE policies SET updated=NOW(), data=${this.sql.json(data as any)} WHERE policy_id=${policy_id}
			RETURNING *
		`;
		if (!result.count) throw Error('no policy found');
		return result[0];
	}

	async deleteById(policy_id: PolicyId): Promise<void> {
		log.debug('[deleteById]', policy_id);
		const result = await this.sql`
			DELETE FROM policies WHERE policy_id=${policy_id}
		`;
		if (!result.count) throw Error('no policy found');
	}

	async filterByAccount(account_id: AccountId): Promise<Policy[]> {
		log.debug('[filterByAccount]', account_id);
		const result = await this.sql<Policy[]>`
		SELECT pol.policy_id, pol.role_id, pol.name, pol.data, pol.created, pol.updated
		FROM policies pol JOIN (							
				SELECT DISTINCT r.role_id FROM roles r JOIN (
					SELECT DISTINCT a.hub_id FROM actors p
					JOIN assignments a ON p.actor_id=a.actor_id AND p.account_id = ${account_id}
				) apc
				ON r.hub_id=apc.hub_id
		) apcr
		ON pol.role_id = apcr.role_id
		`;
		log.debug('[filterByAccount]', result.length);
		return result;
	}

	async filterByHub(hub_id: HubId): Promise<Policy[]> {
		log.debug('[filterByHub]', hub_id);
		const result = await this.sql<Policy[]>`
		SELECT pol.policy_id, pol.role_id, pol.name, pol.data, pol.created, pol.updated
		FROM policies pol JOIN (							
				SELECT DISTINCT r.role_id FROM roles r 
				WHERE r.hub_id=${hub_id}
		) ro
		ON pol.role_id = ro.role_id
		`;
		log.debug('[filterByAccount]', result.length);
		return result;
	}
}
