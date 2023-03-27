import type {ISessionApi} from '$lib/session/SessionApi';

export class SessionApiMock implements ISessionApi {
	account_id: number | undefined;

	async signIn(account_id: number): Promise<void> {
		if (this.account_id) throw Error('already signed in');
		this.account_id = account_id;
	}
	async signOut(): Promise<void> {
		if (!this.account_id) throw Error('not signed in');
		this.account_id = undefined;
	}
}
