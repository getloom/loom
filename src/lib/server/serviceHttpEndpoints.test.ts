import {inject} from 'regexparam';
import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {
	TEST_PORT,
	setupServer,
	teardownServer,
	type TestServerContext,
	initHttpSession,
} from '$lib/util/testServerHelpers.js';
import {services} from '$lib/server/services.js';
import {randomActionParams} from '$lib/util/randomActionParams.js';

/* test__serviceHttpEndpoints */
const test__serviceHttpEndpoints = suite<TestServerContext>('serviceHttpEndpoints');

test__serviceHttpEndpoints.before(setupServer);
test__serviceHttpEndpoints.after(teardownServer);

//we skip these actions, since they are done as part of test spinup and teardown
const skippedServices = new Set(['SignUp', 'CreateAccountActor']);

for (const service of services.values()) {
	const {action} = service;
	if (skippedServices.has(action.name)) continue;

	const {path, method} = action.route;

	test__serviceHttpEndpoints(`perform service ${action.name}`, async ({random}) => {
		const {auth, account, actor} = await initHttpSession();

		const params = await randomActionParams[action.name](random, {account, actor});

		const suffix = params ? inject(path, params) : path;
		const url = `http://localhost:${TEST_PORT}${suffix}`;
		const body = method === 'GET' || method === 'HEAD' ? null : JSON.stringify(params || {});

		const res = await fetch(url, {
			method,
			headers: {
				'content-type': 'application/json',
				accept: 'application/json',
				cookie: auth,
			},
			body,
		});
		assert.ok(res.ok, `${action.name} failed: ${res.status} ${res.statusText}`);
	});
}

test__serviceHttpEndpoints.run();
/* test__serviceHttpEndpoints */
