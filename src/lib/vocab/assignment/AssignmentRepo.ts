import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import {PostgresRepo} from '$lib/db/PostgresRepo.js';
import type {RoleId} from '$lib/vocab/role/role.js';
import type {HubId} from '$lib/vocab/hub/hub.js';
import type {ActorId} from '$lib/vocab/actor/actor.js';
import type {Assignment, AssignmentId} from '$lib/vocab/assignment/assignment.js';
import type {AccountId} from '$lib/vocab/account/account.js';

const log = new Logger(gray('[') + blue('AssignmentRepo') + gray(']'));

export class AssignmentRepo extends PostgresRepo {
	async create(actor_id: ActorId, hub_id: HubId, role_id: RoleId): Promise<Assignment> {
		const data = await this.sql<Assignment[]>`
			INSERT INTO assignments (actor_id, hub_id, role_id) VALUES (
				${actor_id},${hub_id},${role_id}
			) RETURNING *
		`;
		log.debug('created assignment', data[0]);
		return data[0];
	}

	async findById(assignment_id: AssignmentId): Promise<Assignment | undefined> {
		const data = await this.sql<Assignment[]>`
			SELECT assignment_id, actor_id, hub_id, role_id, created
			FROM assignments
			WHERE assignment_id=${assignment_id}
		`;
		return data[0];
	}

	async findByUniqueIds(
		actor_id: ActorId,
		hub_id: HubId,
		role_id: RoleId,
	): Promise<Assignment | undefined> {
		const data = await this.sql<Assignment[]>`
			SELECT assignment_id, actor_id, hub_id, role_id, created
			FROM assignments
			WHERE ${actor_id}=actor_id AND ${hub_id}=hub_id AND ${role_id}=role_id
		`;
		return data[0];
	}

	async filterByAccount(account_id: AccountId): Promise<Assignment[]> {
		log.debug(`[filterByAccount] ${account_id}`);
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.actor_id, a.hub_id, a.role_id, a.created
			FROM assignments a JOIN (
				SELECT DISTINCT a.hub_id FROM actors p 
				JOIN assignments a 
				ON p.actor_id=a.actor_id AND p.account_id=${account_id}
			) apc
			ON a.hub_id=apc.hub_id;
		`;
		return data;
	}

	async filterByActor(actor_id: ActorId): Promise<Assignment[]> {
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.actor_id, a.hub_id, a.role_id, a.created
			FROM assignments a JOIN (
				SELECT DISTINCT hub_id FROM assignments
				WHERE actor_id=${actor_id}
			) ac
			ON a.hub_id=ac.hub_id;
		`;
		return data;
	}

	async filterByHub(hub_id: HubId): Promise<Assignment[]> {
		log.debug(`[filterByHub] ${hub_id}`);
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.actor_id, a.hub_id, a.role_id, a.created
			FROM assignments a 
			WHERE a.hub_id=${hub_id};
		`;
		return data;
	}

	async countAccountActorAssignmentsByHub(hub_id: HubId): Promise<number> {
		log.debug(`[countAccountActorAssignmentsByHub] ${hub_id}`);
		const data = await this.sql<Array<{count: string}>>`
			SELECT count(*)
			FROM actors p JOIN (
				SELECT actor_id
				FROM assignments 
				WHERE hub_id=${hub_id}
			) as a ON a.actor_id = p.actor_id WHERE p.type = 'account';
		`;
		return Number(data[0].count);
	}

	async countDistinctAccountActorsByHub(hub_id: HubId): Promise<number> {
		log.debug(`[countDistinctAccountActorsByHub] ${hub_id}`);
		const data = await this.sql<Array<{count: string}>>`
			SELECT count(*)
			FROM actors p JOIN (
				SELECT DISTINCT actor_id
				FROM assignments 
				WHERE hub_id=${hub_id}
			) as a ON a.actor_id = p.actor_id WHERE p.type = 'account';
		`;
		return Number(data[0].count);
	}

	async isActorInHub(actor_id: ActorId, hub_id: HubId): Promise<boolean> {
		const [{exists}] = await this.sql`
			SELECT EXISTS(SELECT 1 FROM assignments WHERE hub_id=${hub_id} AND actor_id=${actor_id});
		`;
		return exists;
	}

	async deleteById(assignment_id: AssignmentId): Promise<void> {
		const data = await this.sql`
			DELETE FROM assignments 
			WHERE assignment_id=${assignment_id}
		`;
		if (!data.count) throw Error();
	}

	async deleteByActor(actor_id: ActorId): Promise<number> {
		const data = await this.sql`
			DELETE FROM assignments
			WHERE actor_id=${actor_id}
		`;
		return data.count;
	}

	async deleteByActorAndHub(actor_id: ActorId, hub_id: HubId): Promise<number> {
		const data = await this.sql`
			DELETE FROM assignments 
			WHERE ${actor_id}=actor_id AND ${hub_id}=hub_id
		`;
		return data.count;
	}
}
