import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrap_error} from '@ryanatkn/belt/result.js';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers.js';
import {toServiceRequestFake} from '$lib/util/testHelpers.js';
import {
	SIGNUPS_DISABLED_MSG,
	SignUpService,
	VALIDATION_ERRROR_MSG,
} from '$lib/vocab/account/accountServices';
import {ADMIN_HUB_ID} from '$lib/util/constants';
import {randomActionParams} from '$lib/util/randomActionParams';
import {CreateInviteService} from '../invite/inviteServices';

/* test_accountServices */
const test_accountServices = suite<TestDbContext>('hubRepo');

test_accountServices.before(setupDb);
test_accountServices.after(teardownDb);

test_accountServices('test invite system', async ({repos, random}) => {
	//preserve current settings don't delete!
	const adminHub = await repos.hub.loadAdminHub();
	assert.ok(adminHub);
	const {settings} = adminHub;
	const disableSignupsValue = settings.instance?.disableSignups;
	const enableInvitesValue = settings.instance?.enableInviteOnlySignups;

	//turn on invite code
	await repos.hub.updateSettings(ADMIN_HUB_ID, {
		...settings,
		instance: {...settings.instance, enableInviteOnlySignups: true},
	});

	const randomParams = await randomActionParams.SignUp(random);

	//test with no code passe -- expect fail
	const result1 = unwrap_error(
		await SignUpService.perform({
			...toServiceRequestFake(repos),
			params: randomParams,
		}),
	);
	assert.is(result1.status, 400);
	assert.is(result1.message, VALIDATION_ERRROR_MSG);

	//test with invalid code passed (non-alphanumeric & dash) -- expect fail
	randomParams.code = '123;';
	const result2 = unwrap_error(
		await SignUpService.perform({
			...toServiceRequestFake(repos),
			params: randomParams,
		}),
	);
	assert.is(result2.status, 400);
	assert.is(result2.message, VALIDATION_ERRROR_MSG);

	//test with no open codes -- expect fail
	randomParams.code = '3304ce84-fc36-4732-85e3-90a97d637f4c';
	const result3 = unwrap_error(
		await SignUpService.perform({
			...toServiceRequestFake(repos),
			params: randomParams,
		}),
	);
	assert.is(result3.status, 400);
	assert.is(result3.message, VALIDATION_ERRROR_MSG);

	const {actor} = await random.actor();
	//test with a valid code -- expect success and code status update
	const code = unwrap(
		await CreateInviteService.perform({
			...toServiceRequestFake(repos, undefined, actor.account_id),
			params: null,
		}),
	);

	randomParams.code = code.invite.code;
	unwrap(
		await SignUpService.perform({
			...toServiceRequestFake(repos),
			params: randomParams,
		}),
	);

	//try again with the same code and expect failure
	const randomParams2 = await randomActionParams.SignUp(random);
	randomParams2.code = code.invite.code;
	const result4 = unwrap_error(
		await SignUpService.perform({
			...toServiceRequestFake(repos),
			params: randomParams2,
		}),
	);
	assert.is(result4.status, 400);
	assert.is(result4.message, VALIDATION_ERRROR_MSG);

	//turn on disabled signups
	await repos.hub.updateSettings(ADMIN_HUB_ID, {
		...settings,
		instance: {...settings.instance, enableInviteOnlySignups: true, disableSignups: true},
	});

	//expect failure
	const result5 = unwrap_error(
		await SignUpService.perform({
			...toServiceRequestFake(repos),
			params: randomParams2,
		}),
	);
	assert.is(result5.status, 400);
	assert.is(result5.message, SIGNUPS_DISABLED_MSG);

	//turn off invite codes
	await repos.hub.updateSettings(ADMIN_HUB_ID, {
		...settings,
		instance: {...settings.instance, enableInviteOnlySignups: false, disableSignups: true},
	});

	//still expect signups disabled
	const result6 = unwrap_error(
		await SignUpService.perform({
			...toServiceRequestFake(repos),
			params: randomParams2,
		}),
	);
	assert.is(result6.status, 400);
	assert.is(result6.message, SIGNUPS_DISABLED_MSG);

	//cleanup from test; do not delete
	await repos.hub.updateSettings(ADMIN_HUB_ID, {
		...settings,
		instance: {
			...settings.instance,
			disableSignups: disableSignupsValue,
			enableInviteOnlySignups: enableInvitesValue,
		},
	});
});

test_accountServices.run();
/* test_accountServices */
