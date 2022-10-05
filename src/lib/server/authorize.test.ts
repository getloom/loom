import {suite} from 'uvu';
import * as assert from 'uvu/assert';

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
	const result = await authorize(MockAuthorizedService, db.repos, account.account_id, {
		actor: persona.persona_id,
		name: 'test_authorize_success',
	});
	assert.ok(result.ok);
});

test__authorize('actor cannot be impersonated', async ({db, random}) => {
	const account = await random.account();
	const {persona} = await random.persona();
	const result = await authorize(MockAuthorizedService, db.repos, account.account_id, {
		actor: persona.persona_id,
		name: 'test_authorize_failure',
	});
	assert.ok(!result.ok);
});

test__authorize('actor is required for authorized services', async ({db, random}) => {
	const account = await random.account();
	const result = await authorize(MockAuthorizedService, db.repos, account.account_id, {
		name: 'test_authorize_failure',
	});
	assert.ok(!result.ok);
});

test__authorize.run();
/* test__authorize */
