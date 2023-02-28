import {NOT_OK, OK, type Result} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Assignment} from '$lib/vocab/assignment/assignment.js';

const log = new Logger(gray('[') + blue('AssignmentRepo') + gray(']'));

export class AssignmentRepo extends PostgresRepo {
	async create(
		persona_id: number,
		hub_id: number,
		role_id: number,
	): Promise<Result<{value: Assignment}>> {
		const data = await this.sql<Assignment[]>`
			INSERT INTO assignments (persona_id, hub_id, role_id) VALUES (
				${persona_id},${hub_id},${role_id}
			) RETURNING *
		`;
		log.trace('created assignment', data[0]);
		return {ok: true, value: data[0]};
	}

	async findById(assignment_id: number): Promise<Result<{value: Assignment | undefined}>> {
		const data = await this.sql<Assignment[]>`
			SELECT assignment_id, persona_id, hub_id, role_id, created
			FROM assignments
			WHERE assignment_id=${assignment_id}
		`;
		return {ok: true, value: data[0]};
	}

	async findByUniqueIds(
		persona_id: number,
		hub_id: number,
		role_id: number,
	): Promise<Result<{value: Assignment | undefined}>> {
		const data = await this.sql<Assignment[]>`
			SELECT assignment_id, persona_id, hub_id, role_id, created
			FROM assignments
			WHERE ${persona_id}=persona_id AND ${hub_id}=hub_id AND ${role_id}=role_id
		`;
		return {ok: true, value: data[0]};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Assignment[]}>> {
		log.trace(`[filterByAccount] ${account_id}`);
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.persona_id, a.hub_id, a.role_id, a.created
			FROM assignments a JOIN (
				SELECT DISTINCT a.hub_id FROM personas p 
				JOIN assignments a 
				ON p.persona_id=a.persona_id AND p.account_id=${account_id}
			) apc
			ON a.hub_id=apc.hub_id;
		`;
		return {ok: true, value: data};
	}

	async filterByPersona(persona_id: number): Promise<Result<{value: Assignment[]}>> {
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.persona_id, a.hub_id, a.role_id, a.created
			FROM assignments a JOIN (
				SELECT DISTINCT hub_id FROM assignments
				WHERE persona_id=${persona_id}
			) ac
			ON a.hub_id=ac.hub_id;
		`;
		return {ok: true, value: data};
	}

	async filterByHub(hub_id: number): Promise<Result<{value: Assignment[]}>> {
		log.trace(`[filterByHub] ${hub_id}`);
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.persona_id, a.hub_id, a.role_id, a.created
			FROM assignments a 
			WHERE a.hub_id=${hub_id};
		`;
		return {ok: true, value: data};
	}

	async countAccountPersonaAssignmentsByHubId(hub_id: number): Promise<Result<{value: number}>> {
		log.trace(`[filterByHub] ${hub_id}`);
		const data = await this.sql<Array<{count: string}>>`
			SELECT count(*)
			FROM personas p JOIN (
				SELECT persona_id
				FROM assignments 
				WHERE hub_id=${hub_id}
			) as a ON a.persona_id = p.persona_id WHERE p.type = 'account';
		`;
		return {ok: true, value: Number(data[0].count)};
	}

	async isPersonaInHub(persona_id: number, hub_id: number): Promise<Result<{value: boolean}>> {
		const [{exists}] = await this.sql`
			SELECT EXISTS(SELECT 1 FROM assignments WHERE hub_id=${hub_id} AND persona_id=${persona_id});
		`;
		return {ok: true, value: exists};
	}

	async deleteById(assignment_id: number): Promise<Result> {
		const data = await this.sql<any[]>`
			DELETE FROM assignments 
			WHERE assignment_id=${assignment_id}
		`;
		if (!data.count) return NOT_OK;
		return OK;
	}

	async deleteByPersona(persona_id: number): Promise<Result<{value: number}>> {
		const data = await this.sql<any[]>`
			DELETE FROM assignments
			WHERE persona_id=${persona_id}
		`;
		return {ok: true, value: data.count};
	}

	async deleteByPersonaAndHub(
		persona_id: number,
		hub_id: number,
	): Promise<Result<{value: number}>> {
		const data = await this.sql<any[]>`
			DELETE FROM assignments 
			WHERE ${persona_id}=persona_id AND ${hub_id}=hub_id
		`;
		return {ok: true, value: data.count};
	}
}
