import send from '@polka/send-type';
import {Logger} from '@grogarden/util/log.js';

import {blue, gray} from '$lib/server/colors.js';
import type {HttpMiddleware} from '$lib/server/ApiServer.js';
import {parseSessionCookie, setSessionCookie} from '$lib/session/sessionCookie.js';

const log = new Logger(gray('[') + blue('authenticationMiddleware') + gray(']'));

export const cookieSessionMiddleware: HttpMiddleware = async (req, res, next) => {
	if (req.account_id) {
		log.error('unexpectedly already authenticated, server needs to be fixed', req.account_id);
		return send(res, 500, {message: 'invalid server configuration'});
	}
	const parsed = parseSessionCookie(req.headers.cookie);
	if (parsed === undefined) {
		log.debug('unauthenticated request');
		return next();
	} else if (parsed === null) {
		setSessionCookie(res, ''); // reset invalid cookie
		log.debug('unauthenticated request with invalid cookie');
		return next();
	}
	const {account_id, shouldRefreshSignature} = parsed;
	if (shouldRefreshSignature) setSessionCookie(res, account_id); // update signature with first key
	req.account_id = account_id;
	log.debug('authenticated', account_id);
	return next();
};
