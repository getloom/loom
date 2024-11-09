import type {ISessionApi} from '$lib/session/SessionApi.js';
import type {AccountId} from '$lib/vocab/account/account.js';

export class SessionApiFake implements ISessionApi {
	account_id: AccountId | undefined;

	async signIn(account_id: AccountId): Promise<void> {
		if (this.account_id) throw Error('already signed in');
		this.account_id = account_id;
	}
	async signOut(): Promise<void> {
		if (!this.account_id) throw Error('not signed in');
		this.account_id = undefined;
	}

	async getIp(): Promise<string | undefined> {
		return '127.0.0.1';
	}
}
