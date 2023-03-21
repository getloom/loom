import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {checkPersonaName, scrubPersonaName} from '$lib/vocab/actor/personaHelpers';

test('scrubPersonaName', () => {
	assert.is(scrubPersonaName('4bc'), '4bc');
	assert.is(scrubPersonaName(' 4bc '), '4bc');
});

test('checkPersonaName', () => {
	// valid names
	assert.ok(!checkPersonaName('4bc'));
	assert.ok(!checkPersonaName('4-b'));
	assert.ok(!checkPersonaName('4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc'), '39 length allowed');

	// invalid names
	assert.ok(checkPersonaName(''));
	assert.ok(checkPersonaName('4'));
	assert.ok(checkPersonaName('4b'));
	assert.ok(checkPersonaName(' 4bc'));
	assert.ok(checkPersonaName('4bc '));
	assert.ok(checkPersonaName('4b c'));
	assert.ok(checkPersonaName('-4b'));
	assert.ok(checkPersonaName('4b-'));
	assert.ok(checkPersonaName('4_b'), 'hyphens not underscores');
	assert.ok(checkPersonaName('4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4'), '40 length denied');
	assert.ok(checkPersonaName('4@b'), 'no @ allowed');
});

test.run();
