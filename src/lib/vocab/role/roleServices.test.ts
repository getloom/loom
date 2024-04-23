import {suite} from 'uvu';
import {unwrap, unwrap_error} from '@ryanatkn/belt/result.js';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers.js';
import {toServiceRequestFake} from '$lib/util/testHelpers.js';
import {DeleteRoleService} from '$lib/vocab/role/roleServices.js';

/* test_roleServices */
const test_roleServices = suite<TestDbContext>('hubRepo');

test_roleServices.before(setupDb);
test_roleServices.after(teardownDb);

test_roleServices('unable to delete default roles in communites', async ({repos, random}) => {
	const {actor} = await random.actor();
	const {hub} = await random.hub(actor);
	const {role: secondRole} = await random.role(hub, actor);

	unwrap_error(
		await DeleteRoleService.perform({
			...toServiceRequestFake(repos, actor),
			params: {actor: actor.actor_id, role_id: hub.settings.defaultRoleId},
		}),
		'deleting the default role is not allowed',
	);

	unwrap(
		await DeleteRoleService.perform({
			...toServiceRequestFake(repos, actor),
			params: {actor: actor.actor_id, role_id: secondRole.role_id},
		}),
		'delete a non-default role',
	);
});

test_roleServices.run();
/* test_roleServices */
