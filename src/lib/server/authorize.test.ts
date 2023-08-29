import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltjs/util/result.js';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {authorize} from '$lib/server/authorize';
import type {AuthorizedService} from '$lib/server/service';

const FakeAuthorizedService = {action: {authenticate: true, authorize: true}} as AuthorizedService;

/* test__authorize */
const test__authorize = suite<TestDbContext>('services');

test__authorize.before(setupDb);
test__authorize.after(teardownDb);

test__authorize("authorizes an account's actor", async ({repos, random}) => {
	const {actor, account} = await random.actor();
	unwrap(
		await authorize(FakeAuthorizedService, repos, account.account_id, {
			actor: actor.actor_id,
			name: 'test_authorize_success',
		}),
	);
});

test__authorize('actor cannot be imactorted', async ({repos, random}) => {
	const account = await random.account();
	const {actor} = await random.actor();
	unwrapError(
		await authorize(FakeAuthorizedService, repos, account.account_id, {
			actor: actor.actor_id,
			name: 'test_authorize_failure',
		}),
	);
});

test__authorize('actor is required for authorized services', async ({repos, random}) => {
	const account = await random.account();
	unwrapError(
		await authorize(FakeAuthorizedService, repos, account.account_id, {
			name: 'test_authorize_failure',
		}),
	);
});

test__authorize.run();
/* test__authorize */
