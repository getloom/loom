import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {red} from '$lib/server/colors';
import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {log, toServiceRequestMock} from '$lib/util/testHelpers';
import {validateSchema, toValidationErrorMessage} from '$lib/util/ajv';
import {services} from '$lib/server/services';
import {randomEventParams} from '$lib/util/randomEventParams';
import {SessionApiMock} from '$lib/session/SessionApiMock';

/* test__serviceDefinitions */
const test__serviceDefinitions = suite('serviceDefinitions');

// Check each service's definition data for inconsistencies.
for (const service of services.values()) {
	const {event} = service;
	test__serviceDefinitions('service auth definitions: ' + event.name, () => {
		if (event.authenticate === false) {
			// non-authenticated event (no account_id, no actor)
			assert.is(
				event.params.properties?.actor,
				undefined,
				'non-authenticated event params must have no actor',
			);
			assert.is(
				event.authorize,
				false,
				'non-authenticated events must have an authorize value of false',
			);
		} else if (event.authorize === false) {
			// non-authorized event (yes account_id, no actor)
			assert.is(
				event.params.properties?.actor,
				undefined,
				'non-authorized event params must have no actor',
			);
		} else {
			// default to authorized (yes account_id, yes actor)
			assert.equal(
				event.params.properties?.actor,
				{type: 'number'},
				'authorized events must have an actor number property',
			);
			assert.ok(
				Array.isArray(event.params.required) && event.params.required.includes('actor'),
				'authorized events must have a required actor property',
			);
			assert.ok(
				event.authenticate === undefined || event.authenticate,
				'authorized events must have an authenticate value of true or undefined',
			);
		}
	});
}

test__serviceDefinitions(`check for duplicate HTTP route paths`, async () => {
	const paths = new Set();

	for (const service of services.values()) {
		const key = service.event.route.method + ':' + service.event.route.path;
		if (paths.has(key)) {
			throw Error(`Duplicate service event route ${key}`);
		}
		paths.add(key);
	}
});

test__serviceDefinitions.run();
/* test__serviceDefinitions */

/* test__services */
const test__services = suite<TestDbContext>('services');

test__services.before(setupDb);
test__services.after(teardownDb);

const session = new SessionApiMock(); // reuse the session so it tests SignIn sequentially

for (const service of services.values()) {
	const {event} = service;
	test__services(`perform service ${event.name}`, async ({db, random}) => {
		const account = await random.account();
		const params = await randomEventParams[event.name](random, {account});
		if (!validateSchema(event.params)(params)) {
			throw new Error(
				`Failed to validate random params for service ${event.name}: ${toValidationErrorMessage(
					validateSchema(event.params).errors![0],
				)}`,
			);
		}
		const serviceRequest = toServiceRequestMock(
			db,
			event.authorize === false ? undefined! : (await random.persona(account)).persona,
			session,
			event.authenticate === false ? undefined : account.account_id,
		);
		const result = await service.perform({...serviceRequest, params});
		if (!result.ok) {
			log.error(red(`failed service call: ${event.name}`), params, result);
			throw new Error(`Failed service call: ${event.name}`);
		} else if (!validateSchema(event.response)(result.value)) {
			log.error(red(`failed to validate service response: ${event.name}`), params, result);
			throw new Error(
				`Failed to validate response for service ${event.name}: ${toValidationErrorMessage(
					validateSchema(event.response).errors![0],
				)}`,
			);
		}
		if (event.name === 'SignUp') {
			session.signOut(); // sign out after `SignUp` so `SignIn` works (otherwise "already signed in")
		}
		assert.is(result.status, 200); // TODO generate invalid data and test those params+responses too
	});
}

test__services.run();
/* test__services */
