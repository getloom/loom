import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {checkAccountName, scrubAccountName} from '$lib/vocab/account/accountHelpers';

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

test.run();
