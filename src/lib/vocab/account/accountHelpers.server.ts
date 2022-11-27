import type {AccountSettings} from '$lib/vocab/account/account';

// TODO refactor with persona column patterns
export const ACCOUNT_COLUMNS = {
	ClientAccount: ['account_id', 'name', 'settings', 'created', 'updated'],
};

export const toDefaultAccountSettings = (): AccountSettings => ({
	darkmode: false,
});
