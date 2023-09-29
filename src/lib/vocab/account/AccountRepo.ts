import {Logger} from '@grogarden/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {
	Account,
	AccountId,
	ClientAccount,
	ClientAccountSession,
} from '$lib/vocab/account/account';
import {ACCOUNT_COLUMNS, type AccountColumn} from '$lib/vocab/account/accountHelpers.server';
import {ApiError} from '$lib/server/api';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';
import type {PasswordHasher} from '$lib/server/password_hasher';

const log = new Logger(gray('[') + blue('AccountRepo') + gray(']'));

export class AccountRepo extends PostgresRepo {
	async create<T extends AccountColumn>(
		passwordHasher: PasswordHasher,
		name: string,
		password: string,
		settings: Account['settings'],
		columns: T[],
	): Promise<Pick<Account, T>> {
		const passwordKey = await passwordHasher.encrypt(password);
		const data = await this.sql<Array<Pick<Account, T>>>`
			INSERT INTO accounts (name, password, settings) VALUES (
				${name}, ${passwordKey}, ${this.sql.json(settings as any)}
			) RETURNING ${this.sql(columns as string[])}
		`;
		log.debug('created account', data[0]);
		return data[0];
	}

	async loadClientSession(account_id: AccountId): Promise<ClientAccountSession> {
		log.debug('loadClientSession', account_id);
		const account = await this.repos.account.findById(account_id, ACCOUNT_COLUMNS.client);
		if (!account) throw new ApiError(404, 'no account found');

		// TODO optimize?
		const [spaces, directories, sessionActors, hubs, roles, assignments, policies, actors] =
			await Promise.all([
				this.repos.space.filterByAccount(account.account_id),
				this.repos.entity.filterDirectoriesByAccount(account.account_id),
				this.repos.actor.filterByAccount(account.account_id, ACTOR_COLUMNS.all),
				this.repos.hub.filterByAccount(account.account_id),
				this.repos.role.filterByAccount(account.account_id),
				this.repos.assignment.filterByAccount(account.account_id),
				this.repos.policy.filterByAccount(account.account_id),
				this.repos.actor.filterAssociatesByAccount(account.account_id, ACTOR_COLUMNS.public),
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
		columns: T[],
	): Promise<Pick<Account, T> | undefined> {
		log.debug('loading account', account_id);
		const data = await this.sql<Array<Pick<Account, T>>>`
			SELECT ${this.sql(columns as string[])}
			FROM accounts WHERE account_id = ${account_id}
		`;
		return data[0];
	}

	async findByName<T extends AccountColumn>(
		name: string,
		columns: T[],
	): Promise<Pick<Account, T> | undefined> {
		const data = await this.sql<Array<Pick<Account, T>>>`
			SELECT ${this.sql(columns as string[])}
			FROM accounts WHERE LOWER(name)=${name.toLowerCase()}
		`;
		return data[0];
	}

	async updateSettings<T extends AccountColumn>(
		account_id: AccountId,
		settings: ClientAccount['settings'],
		columns: T[],
	): Promise<Pick<Account, T>> {
		const data = await this.sql<Array<Pick<Account, T>>>`
			UPDATE accounts
			SET updated=NOW(), settings=${this.sql.json(settings as any)}
			WHERE account_id=${account_id}
			RETURNING ${this.sql(columns as string[])}
		`;
		if (!data.count) throw Error();
		return data[0];
	}

	async updatePassword<T extends AccountColumn>(
		passwordHasher: PasswordHasher,
		account_id: AccountId,
		password: string,
		columns: T[],
	): Promise<Pick<Account, T>> {
		const passwordKey = await passwordHasher.encrypt(password);
		const data = await this.sql<Array<Pick<Account, T>>>`
			UPDATE accounts
			SET updated=NOW(), password=${passwordKey}
			WHERE account_id=${account_id}
			RETURNING ${this.sql(columns as string[])}
		`;
		if (!data.count) throw Error();
		return data[0];
	}
}
