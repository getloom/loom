import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {
	checkAccountName,
	checkPasswordStrength,
	scrubAccountName,
} from '$lib/vocab/account/accountHelpers.js';

test('scrubAccountName', () => {
	assert.is(scrubAccountName('a@a.a'), 'a@a.a');
	assert.is(scrubAccountName(' a@a.a '), 'a@a.a');
});

test('checkAccountName', () => {
	// valid names
	assert.ok(!checkAccountName('a@a.a'));

	// invalid names
	assert.ok(checkAccountName(''));
	assert.ok(checkAccountName('a'));
	assert.ok(checkAccountName('a@a.'));
	assert.ok(checkAccountName('a@.a'));
	assert.ok(checkAccountName('@a.a'));
	assert.ok(checkAccountName('a@a'));
	assert.ok(checkAccountName('a@'));
	assert.ok(checkAccountName('@a'));
	assert.ok(checkAccountName('a.a'));
	assert.ok(checkAccountName('.a'));
	assert.ok(checkAccountName('a.'));
});

test('checkPasswordStrength', () => {
	// valid passwords
	assert.ok(!checkPasswordStrength('VK3QC*zW'));
	assert.ok(!checkPasswordStrength('VK3QC*zW63W^qg', 14));
	assert.ok(!checkPasswordStrength('abc123', 3));

	// invalid passwords
	assert.ok(checkPasswordStrength('abc123'), 'not long enough');
	assert.ok(checkPasswordStrength('ruT!F4c^vZ^Jt', 14));
	assert.ok(checkPasswordStrength('VK3QC*zW63W^qg', 20));
});

test.run();
