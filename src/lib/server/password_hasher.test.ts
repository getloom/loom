import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {create_password_hasher} from '$lib/server/password_hasher';

/* test__create_password_hasher */
const test__create_password_hasher = suite('create_password_hasher');

test__create_password_hasher('hash a password with a worker pool', async () => {
	const passwordHasher = create_password_hasher();
	const password = 'password';
	const key = await passwordHasher.encrypt(password);
	assert.ok(await passwordHasher.verify(password, key));
	await passwordHasher.close();
});

test__create_password_hasher('hash several passwords concurrently with a worker pool', async () => {
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

test__create_password_hasher('handle errors from the worker pool', async () => {
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

test__create_password_hasher.run();
/* test__create_password_hasher */
