import {NOT_OK, type Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';

import {blue, gray} from '$lib/server/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Account, AccountModel} from '$lib/vocab/account/account.js';
import {toPasswordKey} from '$lib/util/password';

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

	async findById(account_id: number): Promise<Result<{value: AccountModel | undefined}>> {
		log.trace('loading account', account_id);
		const data = await this.sql<AccountModel[]>`
			SELECT account_id, name, settings, created, updated
			FROM accounts WHERE account_id = ${account_id}
		`;
		return {ok: true, value: data[0]};
	}

	// TODO this shouldn't exist, should be `findById` with custom fields
	async findByIdForAuth(account_id: number): Promise<Result<{value: Account | undefined}>> {
		log.trace('loading account', account_id);
		const data = await this.sql<Account[]>`
			SELECT account_id, password
			FROM accounts WHERE account_id=${account_id}
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
		settings: AccountModel['settings'],
	): Promise<Result<{value: AccountModel}>> {
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
	): Promise<Result<{value: AccountModel}>> {
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
