import {OK, type Result} from '@feltcoop/util';

import type {ISessionApi} from '$lib/session/SessionApi';
import type {ErrorResponse} from '$lib/util/error';

export class SessionApiMock implements ISessionApi {
	account_id: number | undefined;

	signIn(account_id: number): Result<object, ErrorResponse> {
		if (this.account_id) return {ok: false, message: 'already signed in'};
		this.account_id = account_id;
		return OK;
	}
	signOut(): Result<object, ErrorResponse> {
		if (!this.account_id) return {ok: false, message: 'not signed in'};
		this.account_id = undefined;
		return OK;
	}
}
