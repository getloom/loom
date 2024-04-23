import type {LayoutServerLoad} from './$types';
import {Logger} from '@ryanatkn/belt/log.js';

import {db} from '$lib/db/db.js';

const log = new Logger('[hooks]');

export const load: LayoutServerLoad = async (event) => {
	const {account_id} = event.locals;
	if (!account_id) return {guest: true};
	try {
		const data = await db.repos.account.loadClientSession(account_id);
		return data;
	} catch (err) {
		// TODO what's the best UX for this condition? just ask the user to try again?
		// If needed, could set `event.locals` to have `handle` manage this condition:
		// event.locals.failedToLoadSession = true;
		log.error('failed to load session for account_id', account_id);
		return {guest: true};
	}
};
