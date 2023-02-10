import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {NOT_OK, ResultError, unwrap, type Result} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {Community} from '$lib/vocab/community/community';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {toDefaultCommunitySettings} from '$lib/vocab/community/communityHelpers.server';

/* test__service */
const test__service = suite<TestDbContext>('services');

test__service.before(setupDb);
test__service.after(teardownDb);

test__service(`roll back the database after a failed transaction`, async ({db, random}) => {
	const {persona} = await random.persona();
	const communityName = 'a';
	let community: Community | undefined;
	let failedResult: Result | undefined;
	const returnedResult = await toServiceRequestMock(db, persona).transact(async (repos) => {
		community = unwrap(
			await repos.community.create(
				'standard',
				communityName,
				toDefaultCommunitySettings(communityName),
			),
		);
		const found = unwrap(await repos.community.findByName(communityName));
		assert.is(found?.name, communityName);
		return (failedResult = NOT_OK);
	});
	assert.ok(community);
	assert.ok(failedResult);
	assert.ok(!failedResult.ok);
	assert.is(returnedResult, failedResult);
	// Ensure the community created in the transaction no longer exists in the db.
	assert.ok(!unwrap(await db.repos.community.findByName(communityName)));
	assert.ok(!unwrap(await db.repos.community.findById(community.community_id)));
});

test__service(`compose multiple calls into one transaction`, async ({db, random}) => {
	const {persona} = await random.persona();
	const serviceRequest = toServiceRequestMock(db, persona);
	const communityName = 'a';
	let community: Community | undefined;
	let failedResult: Result | undefined;
	await serviceRequest.transact(async (reposA) =>
		serviceRequest.transact(async (reposB) =>
			serviceRequest.transact(async (repos) => {
				assert.is(reposA, repos);
				assert.is(reposB, repos);
				community = unwrap(
					await repos.community.create(
						'standard',
						communityName,
						toDefaultCommunitySettings(communityName),
					),
				);
				const found = unwrap(await repos.community.findByName(communityName));
				assert.is(found?.name, communityName);
				return (failedResult = NOT_OK);
			}),
		),
	);
	assert.ok(community);
	assert.ok(failedResult);
	assert.ok(!failedResult.ok);
	assert.ok(!unwrap(await db.repos.community.findById(community.community_id)));
});

test__service(`transact cb returns a 500 when it throws an unknown error`, async ({db, random}) => {
	const {persona} = await random.persona();
	const communityName = 'a';
	let community: Community | undefined;
	const result = await toServiceRequestMock(db, persona).transact(async (repos) => {
		community = unwrap(
			await repos.community.create(
				'standard',
				communityName,
				toDefaultCommunitySettings(communityName),
			),
		);
		throw Error('test failure');
	});
	assert.equal(result, {ok: false, status: 500, message: ResultError.DEFAULT_MESSAGE});
	assert.ok(community);
	assert.ok(!unwrap(await db.repos.community.findById(community.community_id)));
});

test__service(`transact cb passes through the status of a ResultError`, async ({db, random}) => {
	const {persona} = await random.persona();
	const communityName = 'a';
	const thrownResult = {ok: false, status: 409, message: 'test failure'};
	let community: Community | undefined;
	const result = await toServiceRequestMock(db, persona).transact(async (repos) => {
		community = unwrap(
			await repos.community.create(
				'standard',
				communityName,
				toDefaultCommunitySettings(communityName),
			),
		);
		throw new ResultError(thrownResult as any); // TODO remove typecast after upgrading Felt
	});
	assert.equal(result, thrownResult);
	assert.ok(community);
	assert.ok(!unwrap(await db.repos.community.findById(community.community_id)));
});

test__service.run();
/* test__service */
