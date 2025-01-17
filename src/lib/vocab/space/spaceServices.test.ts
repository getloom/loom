import {suite} from 'uvu';
import {unwrap} from '@ryanatkn/belt/result.js';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers.js';
import {DeleteSpaceService} from '$lib/vocab/space/spaceServices.js';
import {toServiceRequestFake} from '$lib/util/testHelpers.js';
import {isDirectory} from '$lib/vocab/entity/entityHelpers.js';

/* test__spaceServices */
const test__spaceServices = suite<TestDbContext>('spaceServices');

test__spaceServices.before(setupDb);
test__spaceServices.after(teardownDb);

test__spaceServices(
	'space directory data has space_id and directory attribute',
	async ({random}) => {
		const {space, directory} = await random.space();
		assert.is(space.space_id, directory.space_id);
		assert.ok(isDirectory(directory));
	},
);

test__spaceServices('delete a space in multiple hubs', async ({repos, random}) => {
	const {space, actor} = await random.space();

	unwrap(
		await DeleteSpaceService.perform({
			...toServiceRequestFake(repos, actor),
			params: {actor: actor.actor_id, space_id: space.space_id},
		}),
	);

	assert.ok(!(await repos.space.findById(space.space_id)));
});

test__spaceServices.run();
/* test__spaceServices */
