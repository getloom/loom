import {suite} from 'uvu';
import {unwrap} from '@feltcoop/util';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {DeleteSpaceService} from '$lib/vocab/space/spaceServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';

/* test__spaceServices */
const test__spaceServices = suite<TestDbContext>('spaceServices');

test__spaceServices.before(setupDb);
test__spaceServices.after(teardownDb);

test__spaceServices(
	'space directory data has space_id and directory attribute',
	async ({random}) => {
		const {space, directory} = await random.space();
		assert.is(space.space_id, directory.space_id);
		assert.is(directory.data.directory, true);
	},
);

test__spaceServices('delete a space in multiple communities', async ({db, random}) => {
	const {space, persona} = await random.space();

	unwrap(
		await DeleteSpaceService.perform({
			...toServiceRequestMock(db, persona),
			params: {actor: persona.persona_id, space_id: space.space_id},
		}),
	);

	assert.ok(!unwrap(await db.repos.space.findById(space.space_id)));
});

test__spaceServices.run();
/* test__spaceServices */
