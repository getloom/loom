import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {verifyPassword, toPasswordKey} from '$lib/server/password';
import {create_password_hasher} from '$lib/server/password_hasher';

/* test__password */
const test__password = suite('password');

test__password('hash and verify a password', async () => {
	const password = 'password';
	const key = await toPasswordKey(password);
	assert.ok(await verifyPassword(password, key));
});

test__password('fail to verify', async () => {
	const password = 'password';
	const key = await toPasswordKey(password);
	assert.not.ok(await verifyPassword('', key));
	assert.not.ok(await verifyPassword(password + '1', key));
	assert.not.ok(await verifyPassword(password, '1' + key));
	assert.not.ok(await verifyPassword(password, await toPasswordKey('')));
	assert.not.ok(await verifyPassword(password, await toPasswordKey(password + '1')));
});

test__password('hash a password with a worker pool', async () => {
	const passwordHasher = create_password_hasher();
	const password = 'password';
	const key = await passwordHasher.encrypt(password);
	assert.ok(await passwordHasher.verify(password, key));
	await passwordHasher.close();
});

test__password('hash several passwords concurrently with a worker pool', async () => {
	const passwordHasher = create_password_hasher();
	const passwords = ['password1', 'password2', 'password3'];
	const keys = await Promise.all(passwords.map((p) => passwordHasher.encrypt(p)));
	const verified = await Promise.all(
		keys.map((key, i) => passwordHasher.verify(passwords[i], key)),
	);
	assert.equal(
		verified,
		passwords.map(() => true),
	);
	await passwordHasher.close();
});

test__password('handle errors from the worker pool', async () => {
	const passwordHasher = create_password_hasher();
	let err;
	try {
		await passwordHasher.encrypt([] as any); // passing bad data to cause an error
	} catch (e) {
		err = e;
	}
	assert.ok(err);
	try {
		await passwordHasher.close(); // should error because it's already closed from the above error
	} catch (e) {
		err = e;
	}
	assert.ok(err);
});

test__password.run();
/* test__password */
