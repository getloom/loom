import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {ADMIN_HUB_NAME, ADMIN_ACTOR_ID, GHOST_ACTOR_ID, GHOST_ACTOR_NAME} from '$lib/app/constants';

/* test__constants */
const test__constants = suite<TestDbContext>('constants');

test__constants.before(setupDb);
test__constants.after(teardownDb);

test__constants('check admin constants', async ({repos, random}) => {
	await random.persona(); // ensure the admin has been created -- there's probably a better way
	const adminPersona = await repos.persona.findById(ADMIN_ACTOR_ID);
	assert.is(adminPersona?.name, ADMIN_HUB_NAME);
	const adminHub = await repos.hub.loadAdminHub();
	assert.is(adminHub?.name, ADMIN_HUB_NAME);
});

test__constants('check ghost constants', async ({repos, random}) => {
	await random.persona(); // ensure the ghost has been created -- there's probably a better way
	const ghostPersona = await repos.persona.findById(GHOST_ACTOR_ID);
	assert.is(ghostPersona?.name, GHOST_ACTOR_NAME);
});

test__constants.run();
/* test__constants */
