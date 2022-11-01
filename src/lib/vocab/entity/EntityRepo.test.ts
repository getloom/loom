import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, testDbCounts, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import type {TombstoneEntityData} from '$lib/vocab/entity/entityData';

/* test__EntityRepo */
const test__EntityRepo = suite<TestDbContext & TestAppContext>('EntityRepo');

test__EntityRepo.before(setupDb);
test__EntityRepo.after(teardownDb);

test__EntityRepo('create and delete entities', async ({db, random}) => {
	const {
		community,
		account,
		personas: [, persona],
		spaces: [space],
	} = await random.community();
	const assertDbCounts = await testDbCounts(db);
	// Create one entity and test that `assertDbCounts` works as expected.
	const {entity: entity1} = await random.entity(persona, account, community, space.directory_id);
	let failed = false;
	try {
		await assertDbCounts();
	} catch (err) {
		failed = true;
	}
	if (!failed) throw Error('Expected assertDbCounts to fail');
	// Create a second entity.
	const {entity: entity2} = await random.entity(persona, account, community, space.directory_id);
	// Delete the created entities, and test that everything is cleaned up.
	unwrap(await db.repos.entity.deleteByIds([entity1.entity_id, entity2.entity_id]));
	await assertDbCounts();
});

test__EntityRepo('find entity by id', async ({db, random}) => {
	const data = {type: 'Note', content: '1'} as const;
	const {entity} = await random.entity(undefined, undefined, undefined, undefined, {data});
	assert.equal(entity.data, data); // just in case
	const found = unwrap(await db.repos.entity.findById(entity.entity_id));
	assert.ok(found);
	assert.is(found.entity_id, entity.entity_id);
	assert.is(found.persona_id, entity.persona_id);
	assert.equal(found.data, data);
});

test__EntityRepo('entites return sorted by descending id', async ({db, random}) => {
	const {space, persona, account} = await random.space();
	const {entity: entity0} = await random.entity(persona, account, undefined, space.directory_id);
	const {entity: entity1} = await random.entity(persona, account, undefined, space.directory_id);
	const {entity: entity2} = await random.entity(persona, account, undefined, space.directory_id);

	// Ensure db sort order is shuffled from the insertion order.
	unwrap(await db.repos.entity.updateEntityData(entity1.entity_id, entity1.data));
	const {entities} = unwrap(
		await db.repos.entity.filterByIds([entity0.entity_id, entity2.entity_id, entity1.entity_id]),
	);
	assert.is(entity2.entity_id, entities[0].entity_id);
	assert.is(entity1.entity_id, entities[1].entity_id);
	assert.is(entity0.entity_id, entities[2].entity_id);
});

test__EntityRepo('disallow mutating directories', async ({db, random}) => {
	const {space: space1} = await random.space();
	const {space: space2} = await random.space();
	const data = {type: 'Collection', space_id: space1.space_id} as const;
	const {entity} = await random.entity(undefined, undefined, undefined, undefined, {data});
	assert.equal(entity.data, data); // just in case

	// Disallow `updateEntityData`
	const updateResult = await db.repos.entity.updateEntityData(entity.entity_id, {
		type: 'Collection',
		space_id: space2.space_id,
	});
	assert.ok(!updateResult.ok);

	// Disallow `eraseByIds`
	const eraseResult = await db.repos.entity.eraseByIds([entity.entity_id]);
	assert.ok(!eraseResult.ok);

	// Ensure nothing in the database changed.
	const found = unwrap(await db.repos.entity.findById(entity.entity_id));
	assert.ok(found);
	assert.is(found.entity_id, entity.entity_id);
	assert.is(found.persona_id, entity.persona_id);
	assert.equal(found.data, data);
});

test__EntityRepo('disallow mutating tombstones', async ({db, random}) => {
	const data = {type: 'Note', content: '1'} as const;
	const {entity} = await random.entity(undefined, undefined, undefined, undefined, {data});
	assert.equal(entity.data, data); // just in case

	// Erase the entity.
	const eraseResult1 = await db.repos.entity.eraseByIds([entity.entity_id]);
	assert.ok(eraseResult1.ok);
	const erased = eraseResult1.value[0];

	// Disallow further `eraseByIds`
	const eraseResult2 = await db.repos.entity.eraseByIds([entity.entity_id]);
	assert.ok(!eraseResult2.ok);

	// Disallow `updateEntityData`
	const updateResult = await db.repos.entity.updateEntityData(entity.entity_id, {
		type: 'Note',
		content: '2',
	});
	assert.ok(!updateResult.ok);

	// Ensure the entity is a Tombstone and didn't get mutated.
	const found = unwrap(await db.repos.entity.findById(entity.entity_id));
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

test__EntityRepo.run();
/* test__EntityRepo */
