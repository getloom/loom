import {NOT_OK, unwrap, type Result} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Account, ClientAccount, ClientAccountSession} from '$lib/vocab/account/account';
import {toPasswordKey} from '$lib/util/password';
import {ACCOUNT_COLUMNS} from '$lib/vocab/account/accountHelpers.server';

const log = new Logger(gray('[') + blue('AccountRepo') + gray(']'));

export class AccountRepo extends PostgresRepo {
	async create(
		name: string,
		password: string,
		settings: Account['settings'],
	): Promise<Result<{value: Account}>> {
		const passwordKey = await toPasswordKey(password);
		const data = await this.sql<Account[]>`
			INSERT INTO accounts (name, password, settings) VALUES (
				${name}, ${passwordKey}, ${this.sql.json(settings)}
			) RETURNING *
		`;
		log.trace('created account', data[0]);
		return {ok: true, value: data[0]};
	}

	async loadClientSession(account_id: number): Promise<Result<{value: ClientAccountSession}>> {
		log.trace('loadClientSession', account_id);
		const account = unwrap(await this.repos.account.findById(account_id));
		if (!account) return NOT_OK; // TODO custom error?

		// TODO optimize?
		const [
			spacesResult,
			directoriesResult,
			sessionPersonasResult,
			communitiesResult,
			rolesResult,
			assignmentsResult,
			policiesResult,
			personasResult,
		] = await Promise.all([
			this.repos.space.filterByAccount(account.account_id),
			this.repos.entity.filterDirectoriesByAccount(account.account_id),
			this.repos.persona.filterByAccount(account.account_id),
			this.repos.community.filterByAccount(account.account_id),
			this.repos.role.filterByAccount(account.account_id),
			this.repos.assignment.filterByAccount(account.account_id),
			this.repos.policy.filterByAccount(account.account_id),
			this.repos.persona.filterAssociatesByAccount(account.account_id),
		]);
		if (!spacesResult.ok) return spacesResult;
		if (!directoriesResult.ok) return directoriesResult;
		if (!sessionPersonasResult.ok) return sessionPersonasResult;
		if (!communitiesResult.ok) return communitiesResult;
		if (!rolesResult.ok) return rolesResult;
		if (!assignmentsResult.ok) return assignmentsResult;
		if (!policiesResult.ok) return policiesResult;
		if (!personasResult.ok) return personasResult;

		return {
			ok: true,
			value: {
				account,
				sessionPersonas: sessionPersonasResult.value,
				communities: communitiesResult.value,
				roles: rolesResult.value,
				spaces: spacesResult.value,
				directories: directoriesResult.value,
				assignments: assignmentsResult.value,
				policies: policiesResult.value,
				personas: personasResult.value,
			},
		};
	}

	async findById<T extends Partial<Account> = ClientAccount>(
		account_id: number,
		columns = ACCOUNT_COLUMNS.ClientAccount,
	): Promise<Result<{value: T | undefined}>> {
		log.trace('loading account', account_id);
		const data = await this.sql<T[]>`
			SELECT ${this.sql(columns)}
			FROM accounts WHERE account_id = ${account_id}
		`;
		return {ok: true, value: data[0]};
	}

	async findByName(name: string): Promise<Result<{value: Account | undefined}>> {
		const data = await this.sql<Account[]>`
			SELECT account_id, name, password, created, updated
			FROM accounts WHERE LOWER(name) = LOWER(${name})
		`;
		return {ok: true, value: data[0]};
	}

	async updateSettings(
		account_id: number,
		settings: ClientAccount['settings'],
	): Promise<Result<{value: ClientAccount}>> {
		const data = await this.sql<any[]>`
			UPDATE accounts
			SET updated=NOW(), settings=${this.sql.json(settings)}
			WHERE account_id=${account_id}
			RETURNING account_id, name, settings, created, updated
		`;
		if (!data.count) return NOT_OK;
		return {ok: true, value: data[0]};
	}

	async updatePassword(
		account_id: number,
		password: string,
	): Promise<Result<{value: ClientAccount}>> {
		const passwordKey = await toPasswordKey(password);
		const data = await this.sql<any[]>`
			UPDATE accounts
			SET updated=NOW(), password=${passwordKey}
			WHERE account_id=${account_id}
			RETURNING account_id, name, settings, created, updated
		`;
		if (!data.count) return NOT_OK;
		return {ok: true, value: data[0]};
	}
}
