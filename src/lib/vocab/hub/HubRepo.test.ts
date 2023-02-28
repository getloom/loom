import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';

/* test__HubRepo */
const test__HubRepo = suite<TestDbContext>('HubRepo');

test__HubRepo.before(setupDb);
test__HubRepo.after(teardownDb);

test__HubRepo('updateSettings', async ({repos, random}) => {
	const {hub} = await random.hub();
	assert.type(hub.settings, 'object');
	assert.type(hub.settings.hue, 'number');
	const newHue = hub.settings.hue === 1 ? 2 : 1;
	const newSettings = {...hub.settings, hue: newHue};
	assert.is.not(hub.settings.hue, newHue); // just in case we mess the logic up
	unwrap(await repos.hub.updateSettings(hub.hub_id, newSettings));
	assert.equal(unwrap(await repos.hub.findById(hub.hub_id))?.settings, newSettings);
});

test__HubRepo.run();
/* test__HubRepo */
