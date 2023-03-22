import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, testDbCounts, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TombstoneEntityData} from '$lib/vocab/entity/entityData';
import {expectError} from '$lib/util/testHelpers';

/* test__EntityRepo */
const test__EntityRepo = suite<TestDbContext>('EntityRepo');

test__EntityRepo.before(setupDb);
test__EntityRepo.after(teardownDb);

test__EntityRepo('create and delete entities', async ({repos, random}) => {
	const {
		hub,
		account,
		persona,
		spaces: [space],
	} = await random.hub();
	const assertDbCounts = await testDbCounts(repos);
	// Create one entity and test that `assertDbCounts` works as expected.
	const {entity: entity1} = await random.entity(persona, account, hub, space, space.directory_id);
	let failed = false;
	try {
		await assertDbCounts();
	} catch (err) {
		failed = true;
	}
	if (!failed) throw Error('Expected assertDbCounts to fail');
	// Create a second entity.
	const {entity: entity2} = await random.entity(persona, account, hub, space, space.directory_id);
	// Delete the created entities, and test that everything is cleaned up.
	await repos.entity.deleteByIds([entity1.entity_id, entity2.entity_id]);
	await assertDbCounts();
});

test__EntityRepo('find entity by id', async ({repos, random}) => {
	const data = {type: 'Note', content: '1'} as const;
	const {entity} = await random.entity(undefined, undefined, undefined, undefined, undefined, {
		data,
	});
	assert.equal(entity.data, data); // just in case
	const found = await repos.entity.findById(entity.entity_id);
	assert.ok(found);
	assert.is(found.entity_id, entity.entity_id);
	assert.is(found.persona_id, entity.persona_id);
	assert.equal(found.data, data);
});

test__EntityRepo('entites return sorted by descending id', async ({repos, random}) => {
	const {space, hub, persona, account} = await random.space();
	const {entity: entity0} = await random.entity(persona, account, hub, space, space.directory_id);
	const {entity: entity1} = await random.entity(persona, account, hub, space, space.directory_id);
	const {entity: entity2} = await random.entity(persona, account, hub, space, space.directory_id);

	// Ensure repos sort order is shuffled from the insertion order.
	await repos.entity.update(entity1.entity_id, entity1.data);
	const {entities} = await repos.entity.filterByIds([
		entity0.entity_id,
		entity2.entity_id,
		entity1.entity_id,
	]);
	assert.is(entity2.entity_id, entities[0].entity_id);
	assert.is(entity1.entity_id, entities[1].entity_id);
	assert.is(entity0.entity_id, entities[2].entity_id);
});

test__EntityRepo('disallow mutating tombstones', async ({repos, random}) => {
	const data = {type: 'Note', content: '1'} as const;
	const {entity} = await random.entity(undefined, undefined, undefined, undefined, undefined, {
		data,
	});
	assert.equal(entity.data, data); // just in case

	// Erase the entity.
	const eraseResult1 = await repos.entity.eraseByIds([entity.entity_id]);
	const erased = eraseResult1[0];

	// Disallow further `eraseByIds`
	await expectError(repos.entity.eraseByIds([entity.entity_id]));

	// Disallow `update`
	await expectError(repos.entity.update(entity.entity_id, {type: 'Note', content: '2'}));

	// Ensure the entity is a Tombstone and didn't get mutated.
	const found = await repos.entity.findById(entity.entity_id);
	assert.ok(found);
	assert.is(found.entity_id, entity.entity_id);
	assert.is(found.persona_id, entity.persona_id);
	const foundData = found.data as TombstoneEntityData;
	assert.is(foundData.type, 'Tombstone');
	assert.is(foundData.formerType, 'Note');
	assert.type(foundData.deleted, 'string');
	assert.is(foundData.content, undefined);
	assert.equal(found, erased);
});

// TODO add similar tests for Tombstones

test__EntityRepo('check filtering for directories by entity id', async ({repos, random}) => {
	//Gen space
	//Gen index entity -> thread entity -> post -> reply
	const {persona, account, hub, space} = await random.space();
	const {space: space2} = await random.space();
	const {entity: entityIndex} = await random.entity(
		persona,
		account,
		hub,
		space,
		space.directory_id,
	);
	const {entity: entityThread} = await random.entity(
		persona,
		account,
		hub,
		space,
		space.directory_id,
	);
	const {entity: entityPost} = await random.entity(
		persona,
		account,
		hub,
		space,
		space.directory_id,
	);
	const {entity: entityReply} = await random.entity(
		persona,
		account,
		hub,
		space,
		space.directory_id,
	);

	await repos.tie.create(entityIndex.entity_id, entityThread.entity_id, 'HasThread');

	await repos.tie.create(entityThread.entity_id, entityPost.entity_id, 'HasPost');

	await repos.tie.create(entityPost.entity_id, entityReply.entity_id, 'HasReply');

	await repos.tie.create(space2.directory_id, entityPost.entity_id, 'HasPost');
	const query1 = await repos.entity.filterDirectoriesByEntity(entityIndex.entity_id);
	assert.equal(query1.length, 1);

	const query2 = await repos.entity.filterDirectoriesByEntity(entityPost.entity_id);
	assert.equal(query2.length, 2);
});

test__EntityRepo.run();
/* test__EntityRepo */
