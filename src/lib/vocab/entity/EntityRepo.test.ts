import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, testDbCounts, type TestDbContext} from '$lib/util/testDbHelpers';
import type {Entity} from '$lib/vocab/entity/entity';
import type {TombstoneEntityData} from '$lib/vocab/entity/entityData';

/* test__EntityRepo */
const test__EntityRepo = suite<TestDbContext>('EntityRepo');

test__EntityRepo.before(setupDb);
test__EntityRepo.after(teardownDb);

test__EntityRepo('create and delete entities', async ({repos, random}) => {
	const {
		hub,
		account,
		actor,
		spaces: [space],
	} = await random.hub();
	const assertDbCounts = await testDbCounts(repos);
	// Create one entity and test that `assertDbCounts` works as expected.
	const {entity: entity1} = await random.entity(actor, account, hub, space, space.directory_id);
	let failed = false;
	try {
		await assertDbCounts();
	} catch (err) {
		failed = true;
	}
	if (!failed) throw Error('Expected assertDbCounts to fail');
	// Create a second entity.
	const {entity: entity2} = await random.entity(actor, account, hub, space, space.directory_id);
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
	assert.is(found.actor_id, entity.actor_id);
	assert.equal(found.data, data);
});

test__EntityRepo('entites return sorted by descending id', async ({repos, random}) => {
	const {space, hub, actor, account} = await random.space();
	const {entity: entity0} = await random.entity(actor, account, hub, space, space.directory_id);
	const {entity: entity1} = await random.entity(actor, account, hub, space, space.directory_id);
	const {entity: entity2} = await random.entity(actor, account, hub, space, space.directory_id);

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

test__EntityRepo('erase entities', async ({repos, random}) => {
	const data = {type: 'Note', content: '1'} as const;
	const {entity} = await random.entity(undefined, undefined, undefined, undefined, undefined, {
		data,
	});
	assert.equal(entity.data, data); // just in case
	const {entity: entity2} = await random.entity(
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		{data},
	);
	const {entity: entity3} = await random.entity(
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		{data},
	);

	const ensureErased = async (e: Entity): Promise<void> => {
		const found = await repos.entity.findById(e.entity_id);
		assert.ok(found);
		assert.equal(found, e);
		const foundData = found.data as TombstoneEntityData;
		assert.is(foundData.type, 'Tombstone');
		assert.is(foundData.formerType, data.type);
		assert.type(foundData.deleted, 'string');
		assert.is(foundData.content, undefined);
	};

	// Erase the entity.
	const erased = await repos.entity.eraseByIds([entity.entity_id]);
	assert.is(erased.length, 1);
	assert.is(erased[0].entity_id, entity.entity_id);
	await ensureErased(erased[0]);

	// Disallow further `eraseByIds` to the same entity as a no-op,
	// but allow valid erasures in the same call.
	const erased2 = await repos.entity.eraseByIds([
		entity2.entity_id,
		entity.entity_id,
		entity3.entity_id,
	]);
	assert.is(erased2.length, 2);
	assert.ok(erased2.some((e) => e.entity_id === entity2.entity_id));
	assert.ok(erased2.some((e) => e.entity_id === entity3.entity_id));
	await ensureErased(erased2[0]);
	await ensureErased(erased2[1]);

	// Allow `update` to the erased entity.
	// TODO this should be restricted through the governance system (see also the todo on the UpdateEntities service)
	const data2 = {type: data.type, content: '2'};
	const updated = await repos.entity.update(entity.entity_id, data2);
	assert.is(updated.entity_id, entity.entity_id);
	assert.equal(updated.data, data2);
});

test__EntityRepo('check filtering for directories by entity id', async ({repos, random}) => {
	//Gen space
	//Gen index entity -> thread entity -> post -> reply
	const {actor, account, hub, space} = await random.space();
	const {space: space2} = await random.space();
	const {entity: entityIndex} = await random.entity(actor, account, hub, space, space.directory_id);
	const {entity: entityThread} = await random.entity(
		actor,
		account,
		hub,
		space,
		space.directory_id,
	);
	const {entity: entityPost} = await random.entity(actor, account, hub, space, space.directory_id);
	const {entity: entityReply} = await random.entity(actor, account, hub, space, space.directory_id);

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
