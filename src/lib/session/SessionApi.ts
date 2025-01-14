import type {ServerResponse} from 'http';
import {Logger} from '@ryanatkn/belt/log.js';

import type {ApiServerRequest} from '$lib/server/ApiServer.js';
import {setSessionCookie} from '$lib/session/sessionCookie.js';
import type {AccountId} from '$lib/vocab/account/account.js';

const log = new Logger('[SessionApi]');

export interface ISessionApi {
	signIn: (account_id: AccountId) => Promise<void>;
	signOut: () => Promise<void>;
	getIp: () => Promise<string | undefined>;
}

/**
 * `SessionApi` is the API available to services beyond the database repos.
 * Unlike repo methods, they do not compose with database transactions,
 * so they cannot be undone automatically if something else goes wrong
 * while the service processes a request.
 */
export class SessionApi implements ISessionApi {
	constructor(
		private readonly req: ApiServerRequest,
		private readonly res: ServerResponse,
	) {}

	async signIn(account_id: AccountId): Promise<void> {
		log.debug('logging in', account_id);
		this.req.account_id = account_id;
		setSessionCookie(this.res, account_id);
	}

	async signOut(): Promise<void> {
		log.debug('logging out', this.req.account_id);
		this.req.account_id = undefined;
		setSessionCookie(this.res, '');
	}

	//TODO I'm not sure if this actually works properly. Currently only used for an optional param in CF verification.
	async getIp(): Promise<string | undefined> {
		log.debug('fetching req ip', this.req.account_id, this.req.socket.remoteAddress);
		return this.req.socket.remoteAddress;
	}
}
