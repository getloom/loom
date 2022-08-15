import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, type Result} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {Community} from '$lib/vocab/community/community';
import {toServiceRequestMock} from '$lib/util/testHelpers';

/* test__service */
const test__service = suite<TestDbContext>('services');

test__service.before(setupDb);
test__service.after(teardownDb);

test__service(`roll back the database after a failed transaction`, async ({db, random}) => {
	const account = await random.account();
	const serviceRequest = toServiceRequestMock(account.account_id, db);
	const communityName = 'a';
	let community: Community | undefined;
	let failedResult: Result | undefined;
	const returnedResult = await serviceRequest.transact(async (repos) => {
		community = unwrap(await repos.community.create('standard', communityName, {hue: 100}));
		const found = unwrap(await repos.community.findByName(communityName));
		assert.is(found?.name, communityName);
		return (failedResult = {ok: false});
	});
	assert.ok(community);
	assert.ok(failedResult);
	assert.ok(!failedResult.ok);
	assert.is(returnedResult, failedResult);
	// Ensure the community created in the transaction no longer exists in the db.
	assert.ok(!unwrap(await db.repos.community.findByName(communityName)));
	assert.ok(!(await db.repos.community.findById(community.community_id)).ok);
});

test__service(`compose multiple calls into one transaction`, async ({db, random}) => {
	const account = await random.account();
	const serviceRequest = toServiceRequestMock(account.account_id, db);
	const communityName = 'a';
	let community: Community | undefined;
	let failedResult: Result | undefined;
	await serviceRequest.transact(async (reposA) =>
		serviceRequest.transact(async (reposB) =>
			serviceRequest.transact(async (repos) => {
				assert.is(reposA, repos);
				assert.is(reposB, repos);
				community = unwrap(await repos.community.create('standard', communityName, {hue: 100}));
				const found = unwrap(await repos.community.findByName(communityName));
				assert.is(found?.name, communityName);
				return (failedResult = {ok: false});
			}),
		),
	);
	assert.ok(community);
	assert.ok(failedResult);
	assert.ok(!failedResult.ok);
	assert.ok(!(await db.repos.community.findById(community.community_id)).ok);
});

test__service(`when a transact cb throws, fail and rethrow`, async ({db, random}) => {
	const account = await random.account();
	const serviceRequest = toServiceRequestMock(account.account_id, db);
	const communityName = 'a';
	let community: Community | undefined;
	let result: any;
	let errorMessage: string | undefined;
	try {
		result = await serviceRequest.transact(async (repos) => {
			community = unwrap(await repos.community.create('standard', communityName, {hue: 100}));
			throw Error('test failure');
		});
	} catch (err) {
		errorMessage = err.message;
	}
	assert.is(result, undefined);
	assert.is(errorMessage, 'test failure');
	assert.ok(community);
	assert.ok(!(await db.repos.community.findById(community.community_id)).ok);
});

test__service.run();
/* test__service */