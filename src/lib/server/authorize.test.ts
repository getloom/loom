import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {authorize} from '$lib/server/authorize';
import type {AuthorizedService} from '$lib/server/service';

const MockAuthorizedService = {action: {authenticate: true, authorize: true}} as AuthorizedService;

/* test__authorize */
const test__authorize = suite<TestDbContext>('services');

test__authorize.before(setupDb);
test__authorize.after(teardownDb);

test__authorize("authorizes an account's persona", async ({repos, random}) => {
	const {persona, account} = await random.persona();
	unwrap(
		await authorize(MockAuthorizedService, repos, account.account_id, {
			actor: persona.actor_id,
			name: 'test_authorize_success',
		}),
	);
});

test__authorize('actor cannot be impersonated', async ({repos, random}) => {
	const account = await random.account();
	const {persona} = await random.persona();
	unwrapError(
		await authorize(MockAuthorizedService, repos, account.account_id, {
			actor: persona.actor_id,
			name: 'test_authorize_failure',
		}),
	);
});

test__authorize('actor is required for authorized services', async ({repos, random}) => {
	const account = await random.account();
	unwrapError(
		await authorize(MockAuthorizedService, repos, account.account_id, {
			name: 'test_authorize_failure',
		}),
	);
});

test__authorize.run();
/* test__authorize */
