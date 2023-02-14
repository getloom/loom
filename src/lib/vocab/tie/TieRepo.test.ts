import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltjs/util';
import {isDeepStrictEqual} from 'util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';

/* test__TieRepo */
const test__TieRepo = suite<TestDbContext>('TieRepo');

test__TieRepo.before(setupDb);
test__TieRepo.after(teardownDb);

test__TieRepo('check filtering down by source id', async ({repos, random}) => {
	//Gen space
	//Gen dir entity -> thread entity -> post -> reply
	const {persona, account, community, space} = await random.space();
	const {entity: entityDir} = await random.entity(
		persona,
		account,
		community,
		space,
		space.directory_id,
	);
	const {entity: entityThread} = await random.entity(
		persona,
		account,
		community,
		space,
		space.directory_id,
	);
	const {entity: entityPost} = await random.entity(
		persona,
		account,
		community,
		space,
		space.directory_id,
	);
	const {entity: entityReply} = await random.entity(
		persona,
		account,
		community,
		space,
		space.directory_id,
	);

	const tie1 = unwrap(
		await repos.tie.create(entityDir.entity_id, entityThread.entity_id, 'HasThread'),
	);

	const tie2 = unwrap(
		await repos.tie.create(entityThread.entity_id, entityPost.entity_id, 'HasPost'),
	);

	const tie3 = unwrap(
		await repos.tie.create(entityPost.entity_id, entityReply.entity_id, 'HasReply'),
	);
	const query1 = unwrap(await repos.tie.filterBySourceId(entityDir.entity_id));
	assert.equal(query1.length, 3);

	const query2 = unwrap(await repos.tie.filterBySourceId(space.directory_id));
	assert.equal(query2.length, 7);
	assert.ok(query2.find((t) => isDeepStrictEqual(t, tie1)));
	assert.ok(query2.find((t) => isDeepStrictEqual(t, tie2)));
	assert.ok(query2.find((t) => isDeepStrictEqual(t, tie3)));
});

test__TieRepo('check filtering up by dest id', async ({repos, random}) => {
	//Gen space
	//Gen index entity -> thread entity -> post -> reply
	const {persona, account, community, space} = await random.space();
	const {entity: entityIndex} = await random.entity(
		persona,
		account,
		community,
		space,
		space.directory_id,
	);
	const {entity: entityThread} = await random.entity(
		persona,
		account,
		community,
		space,
		space.directory_id,
	);
	const {entity: entityPost} = await random.entity(
		persona,
		account,
		community,
		space,
		space.directory_id,
	);
	const {entity: entityReply} = await random.entity(
		persona,
		account,
		community,
		space,
		space.directory_id,
	);

	const tie1 = unwrap(
		await repos.tie.create(entityIndex.entity_id, entityThread.entity_id, 'HasThread'),
	);

	const tie2 = unwrap(
		await repos.tie.create(entityThread.entity_id, entityPost.entity_id, 'HasPost'),
	);

	const tie3 = unwrap(
		await repos.tie.create(entityPost.entity_id, entityReply.entity_id, 'HasReply'),
	);
	const query1 = unwrap(await repos.tie.filterByDestId(entityIndex.entity_id));
	assert.equal(query1.length, 1);

	const query2 = unwrap(await repos.tie.filterByDestId(entityReply.entity_id));
	assert.equal(query2.length, 7);
	assert.ok(query2.find((t) => isDeepStrictEqual(t, tie1)));
	assert.ok(query2.find((t) => isDeepStrictEqual(t, tie2)));
	assert.ok(query2.find((t) => isDeepStrictEqual(t, tie3)));

	const query3 = unwrap(await repos.tie.filterByDestId(space.directory_id));
	assert.equal(query3.length, 0);
});

test__TieRepo.run();
/* test__TieRepo */
