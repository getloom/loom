import type {ISessionApi} from '$lib/session/SessionApi.js';

/**
 * Transports like websockets cannot set http headers,
 * and therefore they cannot access the (currently cookie-only) session,
 * so they pass this disabled session API to services for error reporting.
 */
export class SessionApiDisabled implements ISessionApi {
	async signIn(): Promise<void> {
		throw Error('only http clients can sign in');
	}

	async signOut(): Promise<void> {
		throw Error('only http clients can sign out');
	}
}
