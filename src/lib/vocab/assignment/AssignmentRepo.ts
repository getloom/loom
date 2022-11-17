import {NOT_OK, OK, type Result} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Assignment} from '$lib/vocab/assignment/assignment.js';

const log = new Logger(gray('[') + blue('AssignmentRepo') + gray(']'));

export class AssignmentRepo extends PostgresRepo {
	async create(
		persona_id: number,
		community_id: number,
		role_id: number,
	): Promise<Result<{value: Assignment}>> {
		const data = await this.sql<Assignment[]>`
			INSERT INTO assignments (persona_id, community_id, role_id) VALUES (
				${persona_id},${community_id},${role_id}
			) RETURNING *
		`;
		log.trace('created assignment', data[0]);
		return {ok: true, value: data[0]};
	}

	async findById(assignment_id: number): Promise<Result<{value: Assignment | undefined}>> {
		const data = await this.sql<Assignment[]>`
			SELECT assignment_id, persona_id, community_id, role_id, created
			FROM assignments
			WHERE assignment_id=${assignment_id}
		`;
		return {ok: true, value: data[0]};
	}

	async findByUniqueIds(
		persona_id: number,
		community_id: number,
		role_id: number,
	): Promise<Result<{value: Assignment | undefined}>> {
		const data = await this.sql<Assignment[]>`
			SELECT assignment_id, persona_id, community_id, role_id, created
			FROM assignments
			WHERE ${persona_id}=persona_id AND ${community_id}=community_id AND ${role_id}=role_id
		`;
		return {ok: true, value: data[0]};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Assignment[]}>> {
		log.trace(`[filterByAccount] ${account_id}`);
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.persona_id, a.community_id, a.role_id, a.created
			FROM assignments a JOIN (
				SELECT DISTINCT a.community_id FROM personas p 
				JOIN assignments a 
				ON p.persona_id=a.persona_id AND p.account_id = ${account_id}
			) apc
			ON a.community_id=apc.community_id;
		`;
		return {ok: true, value: data};
	}

	async filterByCommunityId(community_id: number): Promise<Result<{value: Assignment[]}>> {
		log.trace(`[filterByCommunityId] ${community_id}`);
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.persona_id, a.community_id, a.role_id, a.created
			FROM assignments a 
			WHERE a.community_id=${community_id};
		`;
		return {ok: true, value: data};
	}

	//TODO refactor once generic queries are available in psql driver
	async filterAccountPersonaAssignmentsByCommunityId(
		community_id: number,
	): Promise<Result<{value: Assignment[]}>> {
		log.trace(`[filterByCommunityId] ${community_id}`);
		const data = await this.sql<Assignment[]>`
			SELECT a.assignment_id, a.persona_id, a.community_id, a.role_id, a.created
			FROM personas p JOIN (
				SELECT assignment_id, persona_id, community_id, role_id, created
				FROM assignments 
				WHERE community_id=${community_id}
			) as a ON a.persona_id = p.persona_id WHERE p.type = 'account';
		`;
		return {ok: true, value: data};
	}

	async deleteById(assignment_id: number): Promise<Result> {
		const data = await this.sql<any[]>`
			DELETE FROM assignments 
			WHERE assignment_id=${assignment_id}
		`;
		if (!data.count) return NOT_OK;
		return OK;
	}

	async deleteByPersonaAndCommunity(
		persona_id: number,
		community_id: number,
	): Promise<Result<{value: Assignment[]}>> {
		const data = await this.sql<any[]>`
			DELETE FROM assignments 
			WHERE ${persona_id}=persona_id AND ${community_id}=community_id
			RETURNING *
		`;
		if (!data.count) return NOT_OK;
		return {ok: true, value: data};
	}
}
