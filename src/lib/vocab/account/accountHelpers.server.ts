import type {Account, AccountSettings} from '$lib/vocab/account/account.js';

export type AccountColumn = keyof Account;
export const ACCOUNT_COLUMNS = {
	all: ['account_id', 'name', 'password', 'settings', 'created', 'updated'],
	client: ['account_id', 'name', 'settings', 'created', 'updated'],
	account_id: ['account_id'],
	password: ['password'],
	name: ['name'],
	account_id_password: ['account_id', 'password'],
} satisfies Record<string, AccountColumn[]>;

export const toDefaultAccountSettings = (): AccountSettings => ({
	darkmode: false,
});