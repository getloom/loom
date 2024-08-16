import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap_error} from '@ryanatkn/belt/result.js';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers.js';
import {DeleteHubService} from '$lib/vocab/hub/hubServices.js';
import {toServiceRequestFake} from '$lib/util/testHelpers.js';

/* test_accountServices */
const test_accountServices = suite<TestDbContext>('hubRepo');

test_accountServices.before(setupDb);
test_accountServices.after(teardownDb);

test_accountServices('disallow deleting personal hub', async ({repos, random}) => {
	const {actor, personalHub} = await random.actor();
	//TODO hack to allow for authorization; remove on init default impl
	await repos.policy.create(personalHub.settings.defaultRoleId, 'delete_hub');
	assert.is(
		unwrap_error(
			await DeleteHubService.perform({
				...toServiceRequestFake(repos, actor),
				params: {actor: actor.actor_id, hub_id: actor.hub_id},
			}),
		).status,
		405,
	);
});

test_accountServices.run();
/* test_accountServices */
