import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {
	Account,
	AccountId,
	ClientAccount,
	ClientAccountSession,
} from '$lib/vocab/account/account';
import {toPasswordKey} from '$lib/util/password';
import {ACCOUNT_COLUMNS, type AccountColumn} from '$lib/vocab/account/accountHelpers.server';
import {ApiError} from '$lib/server/api';

const log = new Logger(gray('[') + blue('AccountRepo') + gray(']'));

export class AccountRepo extends PostgresRepo {
	async create(name: string, password: string, settings: Account['settings']): Promise<Account> {
		const passwordKey = await toPasswordKey(password);
		const data = await this.sql<Account[]>`
			INSERT INTO accounts (name, password, settings) VALUES (
				${name}, ${passwordKey}, ${this.sql.json(settings as any)}
			) RETURNING *
		`;
		log.debug('created account', data[0]);
		return data[0];
	}

	async loadClientSession(account_id: AccountId): Promise<ClientAccountSession> {
		log.debug('loadClientSession', account_id);
		const account = await this.repos.account.findById(account_id);
		if (!account) throw new ApiError(404, 'no account found');

		// TODO optimize?
		const [spaces, directories, sessionActors, hubs, roles, assignments, policies, actors] =
			await Promise.all([
				this.repos.space.filterByAccount(account.account_id),
				this.repos.entity.filterDirectoriesByAccount(account.account_id),
				this.repos.actor.filterByAccount(account.account_id),
				this.repos.hub.filterByAccount(account.account_id),
				this.repos.role.filterByAccount(account.account_id),
				this.repos.assignment.filterByAccount(account.account_id),
				this.repos.policy.filterByAccount(account.account_id),
				this.repos.actor.filterAssociatesByAccount(account.account_id),
			]);

		return {
			account,
			sessionActors,
			hubs,
			roles,
			spaces,
			assignments,
			directories,
			policies,
			actors,
		};
	}

	async findById<T extends AccountColumn>(
		account_id: AccountId,
		columns: T[] = ACCOUNT_COLUMNS.ClientAccount as T[],
	): Promise<Pick<Account, T> | undefined> {
		log.debug('loading account', account_id);
		const data = await this.sql<Array<Pick<Account, T>>>`
			SELECT ${this.sql(columns as string[])}
			FROM accounts WHERE account_id = ${account_id}
		`;
		return data[0];
	}

	async findByName(name: string): Promise<Account | undefined> {
		const data = await this.sql<Account[]>`
			SELECT account_id, name, password, created, updated
			FROM accounts WHERE LOWER(name) = LOWER(${name})
		`;
		return data[0];
	}

	async updateSettings(
		account_id: AccountId,
		settings: ClientAccount['settings'],
	): Promise<ClientAccount> {
		const data = await this.sql<any[]>`
			UPDATE accounts
			SET updated=NOW(), settings=${this.sql.json(settings as any)}
			WHERE account_id=${account_id}
			RETURNING account_id, name, settings, created, updated
		`;
		if (!data.count) throw Error();
		return data[0];
	}

	async updatePassword(account_id: AccountId, password: string): Promise<ClientAccount> {
		const passwordKey = await toPasswordKey(password);
		const data = await this.sql<any[]>`
			UPDATE accounts
			SET updated=NOW(), password=${passwordKey}
			WHERE account_id=${account_id}
			RETURNING account_id, name, settings, created, updated
		`;
		if (!data.count) throw Error();
		return data[0];
	}
}
