import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {DeleteRoleService} from '$lib/vocab/role/roleServices';

/* test_roleServices */
const test_roleServices = suite<TestDbContext>('communityRepo');

test_roleServices.before(setupDb);
test_roleServices.after(teardownDb);

test_roleServices('unable to delete default roles in communites', async ({db, random}) => {
	const {persona} = await random.persona();
	const {community} = await random.community(persona);
	const {role: secondRole} = await random.role(community, persona);

	unwrapError(
		await DeleteRoleService.perform({
			...toServiceRequestMock(db, persona),
			params: {actor: persona.persona_id, role_id: community.settings.defaultRoleId},
		}),
		'deleting the default role is not allowed',
	);

	unwrap(
		await DeleteRoleService.perform({
			...toServiceRequestMock(db, persona),
			params: {actor: persona.persona_id, role_id: secondRole.role_id},
		}),
		'delete a non-default role',
	);
});

test_roleServices.run();
/* test_roleServices */
