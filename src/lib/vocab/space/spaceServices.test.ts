import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltcoop/felt';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {DeleteSpaceService} from '$lib/vocab/space/spaceServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';

/* test__spaceServices */
const test__spaceServices = suite<TestDbContext & TestAppContext>('spaceServices');

test__spaceServices.before(setupDb);
test__spaceServices.after(teardownDb);

test__spaceServices('space directory data has community and space ids', async ({random}) => {
	const {space, directory} = await random.space();
	assert.is(space.space_id, directory.data.space_id);
});

test__spaceServices('delete a space in multiple communities', async ({db, random}) => {
	const {space, account, persona} = await random.space();

	unwrap(
		await DeleteSpaceService.perform({
			params: {actor: persona.persona_id, space_id: space.space_id},
			...toServiceRequestMock(account.account_id, db),
		}),
	);

	unwrapError(await db.repos.space.findById(space.space_id));
});

test__spaceServices.run();
/* test__spaceServices */
