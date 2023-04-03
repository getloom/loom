import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {RoleId} from '$lib/vocab/role/role';
import type {HubId} from '$lib/vocab/hub/hub';
import type {ActorId} from '$lib/vocab/actor/actor';
import type {Assignment, AssignmentId} from '$lib/vocab/assignment/assignment';
import type {AccountId} from '$lib/vocab/account/account';

const log = new Logger(gray('[') + blue('AssignmentRepo') + gray(']'));

export class AssignmentRepo extends PostgresRepo {
	async create(persona_id: ActorId, hub_id: HubId, role_id: RoleId): Promise<Assignment> {
		const data = await this.sql<Assignment[]>`
			INSERT INTO assignments (persona_id, hub_id, role_id) VALUES (
				${persona_id},${hub_id},${role_id}
			) RETURNING *
		`;
		log.debug('created assignment', data[0]);
		return data[0];
	}

	async findById(assignment_id: AssignmentId): Promise<Assignment | undefined> {
		const data = await this.sql<Assignment[]>`
			SELECT assignment_id, persona_id, hub_id, role_id, created
			FROM assignments
			WHERE assignment_id=${assignment_id}
		`;
		return data[0];
	}

	async findByUniqueIds(
		persona_id: ActorId,
		hub_id: HubId,
		role_id: RoleId,
	): Promise<Assignment | undefined> {
		const data = await this.sql<Assignment[]>`
			SELECT assignment_id, persona_id, hub_id, role_id, created
			FROM assignments
			WHERE ${persona_id}=persona_id AND ${hub_id}=hub_id AND ${role_id}=role_id
		`;
		return data[0];
	}

	async filterByAccount(account_id: AccountId): Promise<Assignment[]> {
		log.debug(`[filterByAccount] ${account_id}`);
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.persona_id, a.hub_id, a.role_id, a.created
			FROM assignments a JOIN (
				SELECT DISTINCT a.hub_id FROM personas p 
				JOIN assignments a 
				ON p.persona_id=a.persona_id AND p.account_id=${account_id}
			) apc
			ON a.hub_id=apc.hub_id;
		`;
		return data;
	}

	async filterByPersona(persona_id: ActorId): Promise<Assignment[]> {
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.persona_id, a.hub_id, a.role_id, a.created
			FROM assignments a JOIN (
				SELECT DISTINCT hub_id FROM assignments
				WHERE persona_id=${persona_id}
			) ac
			ON a.hub_id=ac.hub_id;
		`;
		return data;
	}

	async filterByHub(hub_id: HubId): Promise<Assignment[]> {
		log.debug(`[filterByHub] ${hub_id}`);
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.persona_id, a.hub_id, a.role_id, a.created
			FROM assignments a 
			WHERE a.hub_id=${hub_id};
		`;
		return data;
	}

	async countAccountActorAssignmentsByHubId(hub_id: HubId): Promise<number> {
		log.debug(`[filterByHub] ${hub_id}`);
		const data = await this.sql<Array<{count: string}>>`
			SELECT count(*)
			FROM personas p JOIN (
				SELECT persona_id
				FROM assignments 
				WHERE hub_id=${hub_id}
			) as a ON a.persona_id = p.persona_id WHERE p.type = 'account';
		`;
		return Number(data[0].count);
	}

	async isPersonaInHub(persona_id: ActorId, hub_id: HubId): Promise<boolean> {
		const [{exists}] = await this.sql`
			SELECT EXISTS(SELECT 1 FROM assignments WHERE hub_id=${hub_id} AND persona_id=${persona_id});
		`;
		return exists;
	}

	async deleteById(assignment_id: AssignmentId): Promise<void> {
		const data = await this.sql<any[]>`
			DELETE FROM assignments 
			WHERE assignment_id=${assignment_id}
		`;
		if (!data.count) throw Error();
	}

	async deleteByPersona(persona_id: ActorId): Promise<number> {
		const data = await this.sql<any[]>`
			DELETE FROM assignments
			WHERE persona_id=${persona_id}
		`;
		return data.count;
	}

	async deleteByPersonaAndHub(persona_id: ActorId, hub_id: HubId): Promise<number> {
		const data = await this.sql<any[]>`
			DELETE FROM assignments 
			WHERE ${persona_id}=persona_id AND ${hub_id}=hub_id
		`;
		return data.count;
	}
}
