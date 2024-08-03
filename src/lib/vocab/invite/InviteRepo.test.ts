import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers.js';
import {INVITE_COLUMNS} from './inviteHelpers.server';

/* test__InviteRepo */
const test__InviteRepo = suite<TestDbContext>('InviteRepo');

test__InviteRepo.before(setupDb);
test__InviteRepo.after(teardownDb);

test__InviteRepo('createInvite', async ({repos, random}) => {
	const account = await random.account();
	const invite = await repos.invite.create(account.account_id, INVITE_COLUMNS.all);
	assert.is(invite.from_id, account.account_id);
	assert.is(invite.status, 'open');
});

test__InviteRepo.run();
/* test__InviteRepo */
