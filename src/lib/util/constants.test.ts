import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {
	ADMIN_HUB_NAME,
	ADMIN_ACTOR_ID,
	GHOST_ACTOR_ID,
	GHOST_ACTOR_NAME,
} from '$lib/util/constants';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

/* test__constants */
const test__constants = suite<TestDbContext>('constants');

test__constants.before(setupDb);
test__constants.after(teardownDb);

test__constants('check admin constants', async ({repos, random}) => {
	await random.actor(); // ensure the admin has been created -- there's probably a better way
	const adminActor = await repos.actor.findById(ADMIN_ACTOR_ID, ACTOR_COLUMNS.all);
	assert.is(adminActor?.name, ADMIN_HUB_NAME);
	const adminHub = await repos.hub.loadAdminHub();
	assert.is(adminHub?.name, ADMIN_HUB_NAME);
});

test__constants('check ghost constants', async ({repos, random}) => {
	await random.actor(); // ensure the ghost has been created -- there's probably a better way
	const ghostActor = await repos.actor.findById(GHOST_ACTOR_ID, ACTOR_COLUMNS.all);
	assert.is(ghostActor?.name, GHOST_ACTOR_NAME);
});

test__constants.run();
/* test__constants */
