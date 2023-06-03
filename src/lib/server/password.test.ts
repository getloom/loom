import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {verifyPassword, hashPassword, toPasswordKey} from '$lib/server/password';

/* test__password */
const test__password = suite('verifyPassword');

test__password('hash and verify a password', async () => {
	const password = 'password';
	const key = await hashPassword(password);
	assert.ok(await verifyPassword(password, key));
});

test__password('fail to verify', async () => {
	const password = 'password';
	const key = await hashPassword(password);
	assert.not.ok(await verifyPassword('', key));
	assert.not.ok(await verifyPassword(password + '1', key));
	assert.not.ok(await verifyPassword(password, '1' + key));
	assert.not.ok(await verifyPassword(password, await hashPassword('')));
	assert.not.ok(await verifyPassword(password, await hashPassword(password + '1')));
});

test__password('hash a password with a worker', async () => {
	const password = 'password';
	const key = await toPasswordKey(password);
	assert.ok(await verifyPassword(password, key));
});

test__password.run();
/* test__password */
