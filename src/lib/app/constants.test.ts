import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {
	ADMIN_COMMUNITY_NAME,
	ADMIN_PERSONA_ID,
	GHOST_PERSONA_ID,
	GHOST_PERSONA_NAME,
} from '$lib/app/constants';

/* test__constants */
const test__constants = suite<TestDbContext>('constants');

test__constants.before(setupDb);
test__constants.after(teardownDb);

test__constants('check admin constants', async ({db, random}) => {
	await random.persona(); // ensure the admin has been created -- there's probably a better way
	const adminPersona = unwrap(await db.repos.persona.findById(ADMIN_PERSONA_ID));
	assert.is(adminPersona?.name, ADMIN_COMMUNITY_NAME);
	const adminCommunity = await db.repos.community.loadAdminCommunity();
	assert.is(adminCommunity?.name, ADMIN_COMMUNITY_NAME);
});

test__constants('check ghost constants', async ({db, random}) => {
	await random.persona(); // ensure the ghost has been created -- there's probably a better way
	const ghostPersona = unwrap(await db.repos.persona.findById(GHOST_PERSONA_ID));
	assert.is(ghostPersona?.name, GHOST_PERSONA_NAME);
});

test__constants.run();
/* test__constants */
