import {suite} from 'uvu';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {validateSchema, toValidationErrorMessage} from '$lib/server/ajv';
import {actionDatas} from '$lib/vocab/action/actionData';
import {randomActionParams} from '$lib/util/randomActionParams';
import type {TestAppContext} from '$lib/util/testAppHelpers';
// TODO re-enable after https://github.com/feltjs/felt/pull/922
// import {setupApp, teardownApp} from '$lib/util/testAppHelpers';

/* test__actionDatas */
const test__actionDatas = suite<TestDbContext & TestAppContext>('actionDatas');

test__actionDatas.before(setupDb);
test__actionDatas.after(teardownDb);
// TODO re-enable after https://github.com/feltjs/felt/pull/922
// test__actionDatas.before(setupApp);
// test__actionDatas.after(teardownApp);

for (const actionData of actionDatas.values()) {
	test__actionDatas(`do action ${actionData.name} in a client app`, async ({/*app,*/ random}) => {
		const account = await random.account();
		const params = await randomActionParams[actionData.name](random, {account});

		if (actionData.params) {
			if (!validateSchema(actionData.params)(params)) {
				throw new Error(
					`Failed to validate random params for service ${
						actionData.name
					}: ${toValidationErrorMessage(validateSchema(actionData.params).errors![0])}`,
				);
			}
		} else if (
			actionData.type === 'ServiceAction' &&
			actionData.params !== null // allow void params
		) {
			throw Error(`Expected actionData to have a schema: ${actionData.name}`);
		}

		// TODO can't make remote calls yet -- either use `node-fetch` or fake
		if (actionData.type !== 'ClientAction') {
			return;
		}

		// TODO this fails because the random space is not availabe in the client UI data
		// maybe make the randomizer configurable for populating server and/or client data
		if (actionData.name === 'ViewSpace') {
			return;
		}

		// TODO re-enable after https://github.com/feltjs/felt/pull/922
		// // TODO fix typecast with a union for `actionData`
		// const result = await (app.actions as any)[actionData.name](params);
		// if (actionData.type === 'ClientAction') {
		// 	// TODO don't have schemas for `returns` yet, but eventually we'll want them and then validate here
		// 	if (actionData.returns !== 'void') {
		// 		assert.ok(result !== undefined);
		// 	}
		// } else {
		// 	// TODO can't make remote calls yet -- need to use either `node-fetch` or fake
		// 	// if (!result.ok) {
		// 	// 	log.error(`action failed: ${actionData.name}`, result);
		// 	// } else if (!validateSchema(actionData.response!)(result.value)) {
		// 	// 	log.error(`failed to validate service response: ${actionData.name}`, result);
		// 	// 	throw new Error(
		// 	// 		`Failed to validate response for service ${actionData.name}: ${toValidationErrorMessage(
		// 	// 			validateSchema(actionData.response!).errors![0],
		// 	// 		)}`,
		// 	// 	);
		// 	// }
		// 	// assert.is(result.status, 200); // TODO generate invalid data and test those params+responses too
		// }
	});
}

test__actionDatas.run();
/* test__actionDatas */
