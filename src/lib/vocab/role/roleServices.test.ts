import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {DeleteRoleService} from './roleServices';

/* test_roleServices */
const test_roleServices = suite<TestDbContext & TestAppContext>('communityRepo');

test_roleServices.before(setupDb);
test_roleServices.after(teardownDb);

test_roleServices('unable to delete default roles in communites', async ({db, random}) => {
	const {persona} = await random.persona();
	const {community, role} = await random.community(persona);
	const {role: secondRole} = await random.role(community, persona);
	const serviceRequest = toServiceRequestMock(db, persona);

	unwrapError(
		await DeleteRoleService.perform({
			...serviceRequest,
			params: {actor: persona.persona_id, role_id: role.role_id},
		}),
	);

	unwrap(
		await DeleteRoleService.perform({
			...serviceRequest,
			params: {actor: persona.persona_id, role_id: secondRole.role_id},
		}),
	);
});

test_roleServices.run();
/* test_roleServices */
