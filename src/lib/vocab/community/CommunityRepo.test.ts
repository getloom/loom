import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {RandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';

/* test__CommunityRepo */
const test__CommunityRepo = suite<TestDbContext & TestAppContext>('CommunityRepo');

test__CommunityRepo.before(setupDb);
test__CommunityRepo.after(teardownDb);

test__CommunityRepo('updateSettings', async ({db}) => {
	const random = new RandomVocabContext(db);
	const community = await random.community();
	assert.type(community.settings, 'object');
	assert.type(community.settings.hue, 'number');
	const newHue = community.settings.hue === 1 ? 2 : 1;
	const newSettings = {hue: newHue};
	assert.is.not(community.settings.hue, newHue); // just in case we mess the logic up
	const result = await db.repos.community.updateSettings(community.community_id, newSettings);
	assert.ok(result.ok);
	const updatedCommunity = await db.repos.community.findById(community.community_id);
	assert.ok(updatedCommunity.ok);
	assert.equal(updatedCommunity.value.settings, newSettings);
});

test__CommunityRepo.run();
/* test__CommunityRepo */