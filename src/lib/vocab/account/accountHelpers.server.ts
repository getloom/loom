import type {Account, AccountSettings} from '$lib/vocab/account/account';

export type AccountColumn = keyof Account;
export const ACCOUNT_COLUMNS = {
	ClientAccount: ['account_id', 'name', 'settings', 'created', 'updated'],
	Password: ['password'],
} satisfies Record<string, AccountColumn[]>;

export const toDefaultAccountSettings = (): AccountSettings => ({
	darkmode: false,
});
