import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {Hub} from '$lib/vocab/hub/hub';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {toDefaultHubSettings} from '$lib/vocab/hub/hubHelpers.server';
import {performService} from '$lib/server/service';
import {CreateHubService} from '$lib/vocab/hub/hubServices';
import {randomCommunnityName} from '$lib/util/randomVocab';
import {ApiError, type ApiResult} from '$lib/server/api';
import {randomActionParams} from '$lib/util/randomActionParams';
import {PingService} from '$lib/server/uiServices';

/* test__service */
const test__service = suite<TestDbContext>('services');

test__service.before(setupDb);
test__service.after(teardownDb);

test__service('performService passes through failed results', async ({repos}) => {
	let failedResult: ApiResult | undefined;
	const s: typeof PingService = {
		...PingService,
		perform: async () => {
			return (failedResult = {ok: false, status: 400, message: 'expected fail'});
		},
	};
	const returnedResult = await performService(s, {...toServiceRequestMock(repos), params: null});
	assert.ok(failedResult);
	assert.ok(!failedResult.ok);
	assert.ok(returnedResult === failedResult);
});

test__service('performService passes through a thrown ApiError', async ({repos}) => {
	const s: typeof PingService = {
		...PingService,
		perform: async () => {
			throw new ApiError(400, 'expected fail');
		},
	};
	const result = await performService(s, {...toServiceRequestMock(repos), params: null});
	assert.ok(!result.ok);
	assert.is(result.status, 400);
	assert.is(result.message, 'expected fail');
});

test__service(`roll back the database after a failed transaction`, async ({repos, random}) => {
	const {actor} = await random.actor();
	const hubName = randomCommunnityName();
	let hub: Hub | undefined;
	let failedResult: ApiResult | undefined;
	assert.ok(CreateHubService.transaction);
	const s: typeof CreateHubService = {
		...CreateHubService,
		perform: async ({repos}) => {
			hub = await repos.hub.create('community', hubName, toDefaultHubSettings(hubName));
			const found = await repos.hub.findByName(hubName);
			assert.is(found?.name, hubName);
			return (failedResult = {ok: false, status: 400, message: 'expected fail'});
		},
	};
	const returnedResult = await performService(s, {
		...toServiceRequestMock(repos, actor),
		params: await randomActionParams.CreateHub(random),
	});
	assert.ok(hub);
	assert.ok(failedResult);
	assert.ok(!failedResult.ok);
	assert.ok(returnedResult === failedResult);
	// Ensure the hub created in the transaction no longer exists in the repos.
	assert.ok(!(await repos.hub.findByName(hubName)));
	assert.ok(!(await repos.hub.findById(hub.hub_id)));
});

test__service.run();
/* test__service */
