import {inject} from 'regexparam';
import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {TEST_PORT, initHttp, setupServer, teardownServer} from '$lib/util/testServerHelpers';
import type {ServiceMethod} from '$lib/server/service';
import {services} from '$lib/server/services';
import {randomActionParams} from '$lib/util/randomActionParams';

/* test__serviceHttpEndpoints */
const test__serviceHttpEndpoints = suite<TestServerContext>('serviceHttpEndpoints');

test__serviceHttpEndpoints.before(setupServer);
test__serviceHttpEndpoints.after(teardownServer);

for (const service of services.values()) {
	const {action} = service;
	const path = action.route.path as string;
	const method = action.route.method as ServiceMethod;

	test__serviceHttpEndpoints(`perform service ${action.name}`, async ({random}) => {
		const {auth, account, actor} = await initHttp();

		//we skip these actions, since they are done as part of test spinup and teardown
		if (
			action.name !== 'SignUp' &&
			action.name !== 'SignIn' &&
			action.name !== 'CreateAccountActor' &&
			action.name !== 'SignOut'
		) {
			const params = await randomActionParams[action.name](random, {account, actor});

			const suffix = params ? inject(path, params) : path;
			const url = `http://localhost:${TEST_PORT}${suffix}`;
			const body = method === 'GET' || method === 'HEAD' ? null : JSON.stringify(params || {});

			const res = await fetch(url, {
				method,
				headers: {
					'content-type': 'application/json',
					Cookie: auth,
					Accept: 'application/json',
				},
				body,
			});
			assert.ok(res.ok);
		}
	});
}

test__serviceHttpEndpoints.run();
/* test__serviceHttpEndpoints */
