import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers.js';

/* test__AccountRepo */
const test__AccountRepo = suite<TestDbContext>('AccountRepo');

test__AccountRepo.before(setupDb);
test__AccountRepo.after(teardownDb);

test__AccountRepo('loadClientSession', async ({repos, random}) => {
	const {account, actor, hub, space, directory} = await random.space();
	const loaded = await repos.account.loadClientSession(account.account_id);
	assert.is(loaded.account.account_id, account.account_id);
	loaded.sessionActors.forEach((a) => assert.is(a.account_id, account.account_id));
	assert.ok(loaded.hubs.find((h) => h.hub_id === hub.hub_id));
	assert.ok(loaded.spaces.find((s) => s.space_id === space.space_id));
	assert.ok(loaded.assignments.find((a) => a.hub_id === hub.hub_id));
	assert.ok(loaded.directories.find((d) => d.entity_id === directory.entity_id));
	const loadedRole = loaded.roles.find((r) => r.hub_id === hub.hub_id);
	assert.ok(loadedRole);
	assert.ok(loaded.policies.find((p) => p.role_id === loadedRole.role_id));
	assert.ok(loaded.actors.find((a) => a.actor_id === actor.actor_id));
});

test__AccountRepo.run();
/* test__AccountRepo */
