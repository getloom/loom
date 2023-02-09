import type {Result} from '@feltjs/util';

import type {ISessionApi} from '$lib/session/SessionApi';
import type {ErrorResponse} from '$lib/util/error';

/**
 * Transports like websockets cannot set http headers,
 * and therefore they cannot access the (currently cookie-only) session,
 * so they pass this disabled session API to services for error reporting.
 */
export class SessionApiDisabled implements ISessionApi {
	signIn(): Result<object, ErrorResponse> {
		return {ok: false, message: 'only http clients can sign in'};
	}

	signOut(): Result<object, ErrorResponse> {
		return {ok: false, message: 'only http clients can sign out'};
	}
}
