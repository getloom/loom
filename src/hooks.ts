import type {Handle} from '@sveltejs/kit';

import {parseSessionCookie, setSessionCookie} from '$lib/session/sessionCookie';

export const handle: Handle = async ({event, resolve}) => {
	const parsed = parseSessionCookie(event.request.headers.get('cookie'));
	const account_id = parsed?.account_id;
	if (account_id) {
		event.locals.account_id = account_id;
	}
	const response = await resolve(event);
	if (parsed === null) {
		setSessionCookie(response, ''); // reset invalid cookie
	} else if (account_id && parsed?.shouldRefreshSignature) {
		setSessionCookie(response, account_id); // update signature with first key
	}
	return response;
};
