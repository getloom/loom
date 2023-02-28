import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {NOT_OK, OK, ResultError, unwrap, unwrapError, type Result} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {Hub} from '$lib/vocab/hub/hub';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {toDefaultHubSettings} from '$lib/vocab/hub/hubHelpers.server';

/* test__service */
const test__service = suite<TestDbContext>('services');

test__service.before(setupDb);
test__service.after(teardownDb);

test__service(`roll back the database after a failed transaction`, async ({repos, random}) => {
	const {persona} = await random.persona();
	const hubName = 'a';
	let hub: Hub | undefined;
	let failedResult: Result | undefined;
	const returnedResult = await toServiceRequestMock(repos, persona).transact(async (repos) => {
		hub = unwrap(await repos.hub.create('community', hubName, toDefaultHubSettings(hubName)));
		const found = unwrap(await repos.hub.findByName(hubName));
		assert.is(found?.name, hubName);
		return (failedResult = NOT_OK);
	});
	assert.ok(hub);
	assert.ok(failedResult);
	assert.ok(!failedResult.ok);
	assert.is(returnedResult, failedResult);
	// Ensure the hub created in the transaction no longer exists in the repos.
	assert.ok(!unwrap(await repos.hub.findByName(hubName)));
	assert.ok(!unwrap(await repos.hub.findById(hub.hub_id)));
});

test__service(`cannot call transact more than once`, async ({repos, random}) => {
	const {persona} = await random.persona();
	const serviceRequest = toServiceRequestMock(repos, persona);
	let ranTransact1 = false;
	let ranTransact2 = false;
	unwrapError(
		await serviceRequest.transact(async (reposA) => {
			ranTransact1 = true;
			assert.ok(reposA);
			unwrap(
				await serviceRequest.transact(async () => {
					ranTransact2 = true;
					return OK;
				}),
			);
			return OK;
		}),
	);
	assert.ok(ranTransact1);
	assert.ok(!ranTransact2);
});

test__service(
	`cannot call transact more than once even after the first ends`,
	async ({repos, random}) => {
		const {persona} = await random.persona();
		const serviceRequest = toServiceRequestMock(repos, persona);
		let ranTransact1 = false;
		let ranTransact2 = false;
		unwrap(
			await serviceRequest.transact(async (reposA) => {
				ranTransact1 = true;
				assert.ok(reposA);
				return OK;
			}),
		);
		assert.ok(ranTransact1);
		unwrapError(
			await serviceRequest.transact(async () => {
				ranTransact2 = true;
			}),
		);
		assert.ok(!ranTransact2);
	},
);

test__service(
	`transact cb returns a 500 when it throws an unknown error`,
	async ({repos, random}) => {
		const {persona} = await random.persona();
		const hubName = 'a';
		let hub: Hub | undefined;
		const result = await toServiceRequestMock(repos, persona).transact(async (repos) => {
			hub = unwrap(await repos.hub.create('community', hubName, toDefaultHubSettings(hubName)));
			throw Error('test failure');
		});
		assert.equal(result, {ok: false, status: 500, message: ResultError.DEFAULT_MESSAGE});
		assert.ok(hub);
		assert.ok(!unwrap(await repos.hub.findById(hub.hub_id)));
	},
);

test__service(`transact cb passes through the status of a ResultError`, async ({repos, random}) => {
	const {persona} = await random.persona();
	const hubName = 'a';
	const thrownResult = {ok: false, status: 409, message: 'test failure'};
	let hub: Hub | undefined;
	const result = await toServiceRequestMock(repos, persona).transact(async (repos) => {
		hub = unwrap(await repos.hub.create('community', hubName, toDefaultHubSettings(hubName)));
		throw new ResultError(thrownResult as any); // TODO remove typecast after upgrading Felt
	});
	assert.equal(result, thrownResult);
	assert.ok(hub);
	assert.ok(!unwrap(await repos.hub.findById(hub.hub_id)));
});

test__service.run();
/* test__service */
