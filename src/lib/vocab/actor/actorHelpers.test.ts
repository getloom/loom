import {test} from 'uvu';
import * as assert from 'uvu/assert';

import {checkActorName, scrubActorName} from '$lib/vocab/actor/actorHelpers';

test('scrubActorName', () => {
	assert.is(scrubActorName('4bc'), '4bc');
	assert.is(scrubActorName(' 4bc '), '4bc');
});

test('checkActorName', () => {
	// valid names
	assert.ok(!checkActorName('a'));
	assert.ok(!checkActorName('1'));
	assert.ok(!checkActorName('4bc'));
	assert.ok(!checkActorName('4_b'));
	assert.ok(!checkActorName('4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc'), '30 length allowed');

	// invalid names
	assert.ok(checkActorName(''));
	assert.ok(checkActorName(' 4bc'));
	assert.ok(checkActorName('4bc '));
	assert.ok(checkActorName('4b c'));
	assert.ok(checkActorName('_4b'));
	assert.ok(checkActorName('4b_'));
	assert.ok(checkActorName('4-b'), 'underscores not hyphens');
	assert.ok(checkActorName('4bc4bc4bc4bc4bc4bc4bc4bc4bc4bc4'), '31 length denied');
	assert.ok(checkActorName('4@b'), 'no @ allowed');
});

test.run();
