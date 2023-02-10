import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {authorize} from '$lib/server/authorize';
import type {AuthorizedService} from '$lib/server/service';

const MockAuthorizedService = {event: {authenticate: true, authorize: true}} as AuthorizedService;

/* test__authorize */
const test__authorize = suite<TestDbContext>('services');

test__authorize.before(setupDb);
test__authorize.after(teardownDb);

test__authorize("authorizes an account's persona", async ({db, random}) => {
	const {persona, account} = await random.persona();
	unwrap(
		await authorize(MockAuthorizedService, db.repos, account.account_id, {
			actor: persona.persona_id,
			name: 'test_authorize_success',
		}),
	);
});

test__authorize('actor cannot be impersonated', async ({db, random}) => {
	const account = await random.account();
	const {persona} = await random.persona();
	unwrapError(
		await authorize(MockAuthorizedService, db.repos, account.account_id, {
			actor: persona.persona_id,
			name: 'test_authorize_failure',
		}),
	);
});

test__authorize('actor is required for authorized services', async ({db, random}) => {
	const account = await random.account();
	unwrapError(
		await authorize(MockAuthorizedService, db.repos, account.account_id, {
			name: 'test_authorize_failure',
		}),
	);
});

test__authorize.run();
/* test__authorize */
