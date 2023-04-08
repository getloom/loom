import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {checkActorName, scrubActorName} from '$lib/vocab/actor/actorHelpers';

test('scrubActorName', () => {
	assert.is(scrubActorName('4bc'), '4bc');
	assert.is(scrubActorName(' 4bc '), '4bc');
});

test('checkActorName', () => {
	// valid names
	assert.ok(!checkActorName('4bc'));
	assert.ok(!checkActorName('4-b'));
	assert.ok(!checkActorName('4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc'), '39 length allowed');

	// invalid names
	assert.ok(checkActorName(''));
	assert.ok(checkActorName('4'));
	assert.ok(checkActorName('4b'));
	assert.ok(checkActorName(' 4bc'));
	assert.ok(checkActorName('4bc '));
	assert.ok(checkActorName('4b c'));
	assert.ok(checkActorName('-4b'));
	assert.ok(checkActorName('4b-'));
	assert.ok(checkActorName('4_b'), 'hyphens not underscores');
	assert.ok(checkActorName('4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4'), '40 length denied');
	assert.ok(checkActorName('4@b'), 'no @ allowed');
});

test.run();
