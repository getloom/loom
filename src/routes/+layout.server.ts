import type {LayoutServerLoad} from './$types';
import {Logger} from '@feltcoop/felt/util/log.js';

import {db} from '$lib/db/db';

const log = new Logger('[hooks]');

export const load: LayoutServerLoad = async (event) => {
	const {account_id} = event.locals;
	if (!account_id) return {guest: true};
	const result = await db.repos.session.loadClientSession(account_id);
	if (!result.ok) {
		// TODO what's the best UX for this condition? just ask the user to try again?
		// If needed, could set `event.locals` to have `handle` manage this condition:
		// event.locals.failedToLoadSession = true;
		log.error('failed to load session for account_id', account_id);
		return {guest: true};
	}
	return result.value;
};