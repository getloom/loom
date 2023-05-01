import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {red} from '$lib/server/colors';
import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {log, toServiceRequestMock} from '$lib/util/testHelpers';
import {validateSchema, toValidationErrorMessage} from '$lib/util/ajv';
import {services} from '$lib/server/services';
import {randomActionParams} from '$lib/util/randomActionParams';
import {SessionApiMock} from '$lib/session/SessionApiMock';
import {toFailedApiResult} from '$lib/server/api';

/* test__serviceDefinitions */
const test__serviceDefinitions = suite('serviceDefinitions');

// Check each service's definition data for inconsistencies.
for (const service of services.values()) {
	const {action} = service;
	test__serviceDefinitions('service auth definitions: ' + action.name, () => {
		if (action.authenticate === false) {
			// non-authenticated action (no account_id, no actor)
			assert.is(
				action.params.properties?.actor,
				undefined,
				'non-authenticated action params must have no actor',
			);
			assert.is(
				action.authorize,
				false,
				'non-authenticated actions must have an authorize value of false',
			);
		} else if (action.authorize === false) {
			// non-authorized action (yes account_id, no actor)
			assert.is(
				action.params.properties?.actor,
				undefined,
				'non-authorized action params must have no actor',
			);
		} else {
			// default to authorized (yes account_id, yes actor)
			assert.equal(
				action.params.properties?.actor.$ref,
				'/schemas/ActorId.json',
				'authorized actions must have an actor number property with type ActorId',
			);
			assert.ok(
				Array.isArray(action.params.required) && action.params.required.includes('actor'),
				'authorized actions must have a required actor property',
			);
			assert.ok(
				action.authenticate === undefined || action.authenticate,
				'authorized actions must have an authenticate value of true or undefined',
			);
		}
	});
}

test__serviceDefinitions(`check for duplicate HTTP route paths`, async () => {
	const paths = new Set();

	for (const service of services.values()) {
		const key = service.action.route.method + ':' + service.action.route.path;
		if (paths.has(key)) {
			throw Error(`Duplicate service action route ${key}`);
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
	const {action} = service;
	test__services(`perform service ${action.name}`, async ({repos, random}) => {
		const account = await random.account();
		const {actor} = await random.actor(account);
		const params = await randomActionParams[action.name](random, {account, actor});
		if (!validateSchema(action.params)(params)) {
			throw new Error(
				`Failed to validate random params for service ${action.name}: ${toValidationErrorMessage(
					validateSchema(action.params).errors![0],
				)}`,
			);
		}
		const result = await service.perform({
			...toServiceRequestMock(
				repos,
				action.authorize === false ? undefined! : actor,
				session,
				action.authenticate === false ? undefined : account.account_id,
			),
			params,
		});
		if (!result.ok) {
			log.error(red(`failed service call: ${action.name}`), params, result);
			throw new Error(`Failed service call: ${action.name}`);
		} else if (!validateSchema(action.response)(result.value)) {
			log.error(red(`failed to validate service response: ${action.name}`), params, result);
			throw new Error(
				`Failed to validate response for service ${action.name}: ${toValidationErrorMessage(
					validateSchema(action.response).errors![0],
				)}`,
			);
		}
		if (action.name === 'SignUp') {
			await session.signOut(); // sign out after `SignUp` so `SignIn` works (otherwise "already signed in")
		}
		assert.is(result.status, 200); // TODO generate invalid data and test those params+responses too

		// Test failure of authorized services with an unauthorized actor.
		if (action.authorize !== false && action.name !== 'CreateHub') {
			const {actor: unauthorizedActor} = await random.actor(account);

			// create a new hub without the actor, otherwise they might have permissions
			const hubData = await random.hub(undefined, account);
			const failedParams = await randomActionParams[action.name](random, {
				...hubData,
				space: hubData.spaces[1],
				account,
				role: hubData.roles[0],
			});
			if (failedParams && 'actor' in failedParams) {
				failedParams.actor = unauthorizedActor.actor_id;
			}

			let failedResult;
			try {
				failedResult = await service.perform({
					...toServiceRequestMock(repos, unauthorizedActor, session, account.account_id),
					params: failedParams,
				});
			} catch (err) {
				failedResult = toFailedApiResult(err);
			}

			assert.ok(
				!failedResult.ok,
				`Expected service ${action.name} to fail with invalid actor - are the policies checked?`,
			);
			assert.is(
				failedResult.status,
				403,
				`Expected service ${action.name} to fail with status code 403`,
			);
		}
	});
}

test__services.run();
/* test__services */
