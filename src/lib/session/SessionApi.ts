import type {ServerResponse} from 'http';
import {OK, type Result} from '@feltcoop/util';

import type {ApiServerRequest} from '$lib/server/ApiServer';
import {setSessionCookie} from '$lib/session/sessionCookie';
import {Logger} from '@feltcoop/util/log.js';
import type {ErrorResponse} from '$lib/util/error';

const log = new Logger('[SessionApi]');

export interface ISessionApi {
	signIn: (account_id: number) => Result<object, ErrorResponse>;
	signOut: () => Result<object, ErrorResponse>;
}

/**
 * `SessionApi` is the API available to services beyond the database repos.
 * Unlike repo methods, they do not compose with database transactions,
 * so they cannot be undone automatically if something else goes wrong
 * while the service processes a request.
 */
export class SessionApi implements ISessionApi {
	constructor(private readonly req: ApiServerRequest, private readonly res: ServerResponse) {}

	signIn(account_id: number): Result<object, ErrorResponse> {
		log.trace('logging in', account_id);
		this.req.account_id = account_id;
		setSessionCookie(this.res, account_id);
		return OK;
	}

	signOut(): Result<object, ErrorResponse> {
		log.trace('logging out', this.req.account_id);
		this.req.account_id = undefined;
		setSessionCookie(this.res, '');
		return OK;
	}
}
