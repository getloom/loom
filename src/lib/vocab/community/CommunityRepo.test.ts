import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';

/* test__CommunityRepo */
const test__CommunityRepo = suite<TestDbContext>('CommunityRepo');

test__CommunityRepo.before(setupDb);
test__CommunityRepo.after(teardownDb);

test__CommunityRepo('updateSettings', async ({db, random}) => {
	const {community} = await random.community();
	assert.type(community.settings, 'object');
	assert.type(community.settings.hue, 'number');
	const newHue = community.settings.hue === 1 ? 2 : 1;
	const newSettings = {...community.settings, hue: newHue};
	assert.is.not(community.settings.hue, newHue); // just in case we mess the logic up
	unwrap(await db.repos.community.updateSettings(community.community_id, newSettings));
	assert.equal(
		unwrap(await db.repos.community.findById(community.community_id))?.settings,
		newSettings,
	);
});

test__CommunityRepo.run();
/* test__CommunityRepo */
