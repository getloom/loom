import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {NoteEntityData, OrderedCollectionEntityData} from '$lib/vocab/entity/entityData';
import {expectApiError, invite, toServiceRequestMock} from '$lib/util/testHelpers';
import {
	ReadEntitiesService,
	DeleteEntitiesService,
	CreateEntityService,
	UpdateEntitiesService,
	EraseEntitiesService,
} from '$lib/vocab/entity/entityServices';
import {DEFAULT_PAGE_SIZE} from '$lib/util/constants';
import {validateSchema} from '$lib/util/ajv';

/* test_entityServices */
const test_entityServices = suite<TestDbContext>('hubRepo');

test_entityServices.before(setupDb);
test_entityServices.after(teardownDb);

test_entityServices('create entities with data', async ({random}) => {
	const {space, actor, account, hub} = await random.space();

	const entityData1: NoteEntityData = {content: 'this is entity 1'};
	const entityData2: NoteEntityData = {content: 'entity: 2'};
	const {entity: entity1, ties: ties1} = await random.entity(
		actor,
		account,
		hub,
		space,
		space.directory_id,
		{data: entityData1},
	);
	const {entity: entity2, ties: ties2} = await random.entity(
		actor,
		account,
		hub,
		space,
		space.directory_id,
		{data: entityData2},
	);
	assert.is(entity1.actor_id, actor.actor_id);
	assert.is(entity2.actor_id, actor.actor_id);
	assert.equal(entity1.data, entityData1);
	assert.equal(entity2.data, entityData2);
	assert.is(ties1.length, 1);
	assert.is(ties2.length, 1);
	assert.is(ties1[0].source_id, ties2[0].source_id);
	assert.is(ties1[0].source_id, space.directory_id);
	assert.is(ties1[0].dest_id, entity1.entity_id);
	assert.is(ties2[0].dest_id, entity2.entity_id);
});

test_entityServices('create entity and return it and directories', async ({repos, random}) => {
	const {space, actor, account, hub} = await random.space();
	const {space: space2} = await random.space(actor, account, hub);

	const entityData = {content: 'test'} as const;
	const sourceIds = [space.directory_id, space2.directory_id].sort((a, b) => a - b);

	const {entities} = unwrap(
		await CreateEntityService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				space_id: space.space_id,
				data: entityData,
				ties: sourceIds.map((source_id) => ({source_id})),
			},
		}),
	);

	assert.is(entities.length, 3);
	assert.equal(entities[0].data, entityData);
	assert.equal(
		sourceIds,
		entities
			.slice(1)
			.map((e) => e.entity_id)
			.sort((a, b) => a - b),
	);
});

test_entityServices('read paginated entities by source_id', async ({repos, random}) => {
	const {space, actor, account, hub} = await random.space();

	//first query on the space dir and expect an empty set
	const {entities: filtered, more: more1} = unwrap(
		await ReadEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {actor: actor.actor_id, source_id: space.directory_id},
		}),
	);

	assert.is(filtered.length, 0);
	assert.ok(!more1);

	const entities = (
		await Promise.all(
			Array.from({length: DEFAULT_PAGE_SIZE + 1}, (_, i) =>
				random.entity(actor, account, hub, space, space.directory_id, {
					data: {content: `This is note ${i}`},
				}),
			),
		)
	)
		.map((v) => v.entity)
		.sort((a, b) => b.entity_id - a.entity_id);

	//test the default param returns properly
	const {entities: filtered2, more: more2} = unwrap(
		await ReadEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {actor: actor.actor_id, source_id: space.directory_id},
		}),
	);
	assert.is(filtered2.length, DEFAULT_PAGE_SIZE);
	assert.equal(filtered2.slice(), entities.slice(0, -1));
	assert.ok(more2);

	const FIRST_PAGE_SIZE = Math.floor(DEFAULT_PAGE_SIZE / 2);
	const SECOND_PAGE_SIZE = Math.ceil(DEFAULT_PAGE_SIZE / 2);

	//then do 3 queries on smaller pages
	const {entities: filtered3, more: more3} = unwrap(
		await ReadEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				source_id: space.directory_id,
				pageSize: FIRST_PAGE_SIZE,
			},
		}),
	);

	assert.is(filtered3.length, FIRST_PAGE_SIZE);
	assert.ok(more3);

	const {entities: filtered4, more: more4} = unwrap(
		await ReadEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				source_id: space.directory_id,
				pageSize: SECOND_PAGE_SIZE,
				pageKey: filtered3.at(-1)!.entity_id,
			},
		}),
	);

	assert.is(filtered4.length, SECOND_PAGE_SIZE);
	assert.ok(!filtered3.find((v) => v.entity_id === filtered4[0].entity_id));
	assert.ok(more4);

	const {entities: filtered5, more: more5} = unwrap(
		await ReadEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				source_id: space.directory_id,
				pageSize: SECOND_PAGE_SIZE,
				pageKey: filtered4.at(-1)!.entity_id,
			},
		}),
	);
	assert.is(filtered5.length, 1);
	assert.ok(!more5);

	assert.equal(filtered3.concat(filtered4).concat(filtered5), entities);
});

//TODO move to action tests if/when that happens
test_entityServices('assert default as max pageSize', async ({random}) => {
	const {space} = await random.space();

	const validateParams = validateSchema(ReadEntitiesService.action.params);
	assert.ok(!validateParams({source_id: space.directory_id, pageSize: DEFAULT_PAGE_SIZE + 1}));
});

test_entityServices('deleting entities and cleaning orphans', async ({random, repos}) => {
	const {space, actor, account, hub} = await random.space();
	//generate a collection with 3 notes
	const {entity: list} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: {type: 'Collection', content: `grocery list`},
	});
	const {entity: todo1} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: {content: `eggs`},
		ties: [{source_id: list.entity_id}],
	});
	const {entity: todo2} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: {content: `bread`},
		ties: [{source_id: list.entity_id}],
	});
	const {entity: todo3} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: {content: `milk`},
		ties: [{source_id: list.entity_id}],
	});
	const entityIds = [todo1.entity_id, todo2.entity_id, todo3.entity_id];
	const filterResult = await repos.entity.filterByIds(entityIds);
	assert.is(filterResult.entities.length, 3);
	assert.is(filterResult.missing, null);
	//delete the collection
	unwrap(
		await DeleteEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {actor: actor.actor_id, entityIds: [list.entity_id]},
		}),
	);
	const {missing} = await repos.entity.filterByIds(entityIds);
	assert.equal(missing, entityIds);
});

test_entityServices(
	'can only delete, erase, or update other actors entities in "common" views',
	async ({repos, random}) => {
		const {space, actor, account, hub} = await random.space();
		const {space: commonSpace} = await random.space(actor, account, hub, '<Todo />');
		const {actor: actor2} = await random.actor();

		await invite(repos, actor, hub.hub_id, actor2.name);

		//case 1, actor === actor in regular space | allowed
		const note1 = unwrap(
			await CreateEntityService.perform({
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					data: {content: 'note1'},
					space_id: space.space_id,
				},
			}),
		).entities[0];

		unwrap(
			await UpdateEntitiesService.perform({
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					entities: [{entity_id: note1.entity_id, data: {content: 'Note1'}}],
				},
			}),
		);

		//case 2, actor === actor in common space | allowed
		const note2 = unwrap(
			await CreateEntityService.perform({
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					data: {content: 'note2'},
					space_id: commonSpace.space_id,
				},
			}),
		).entities[0];

		unwrap(
			await UpdateEntitiesService.perform({
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					entities: [{entity_id: note2.entity_id, data: {content: 'Note2'}}],
				},
			}),
		);

		//case 3, actor !== actor in common space | allowed
		unwrap(
			await UpdateEntitiesService.perform({
				...toServiceRequestMock(repos, actor2),
				params: {
					actor: actor2.actor_id,
					entities: [{entity_id: note2.entity_id, data: {content: 'lol'}}],
				},
			}),
		);

		//case 4, actor !== actor in regular space | block
		await expectApiError(
			403,
			UpdateEntitiesService.perform({
				...toServiceRequestMock(repos, actor2),
				params: {
					actor: actor2.actor_id,
					entities: [{entity_id: note1.entity_id, data: {content: 'lol'}}],
				},
			}),
		);
	},
);

test_entityServices('disallow mutating directory', async ({repos, random}) => {
	const {directory, actor} = await random.space();

	assert.is(directory.data.type, 'Collection');
	assert.ok(directory.data.directory);

	// Disallow changing the directory's type
	await expectApiError(
		403,
		UpdateEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				entities: [{entity_id: directory.entity_id, data: {content: 'test'}}],
			},
		}),
	);

	// Disallow removing `data.directory`
	await expectApiError(
		403,
		UpdateEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				entities: [{entity_id: directory.entity_id, data: {type: 'Collection'}}],
			},
		}),
	);

	// Disallow changing `data.directory`
	await expectApiError(
		403,
		UpdateEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				entities: [
					{entity_id: directory.entity_id, data: {type: 'Collection', directory: false as any}},
				],
			},
		}),
	);

	// Disallow deleting the directory
	await expectApiError(
		403,
		DeleteEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				entityIds: [directory.entity_id],
			},
		}),
	);

	// Disallow erasing the directory
	await expectApiError(
		403,
		EraseEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				entityIds: [directory.entity_id],
			},
		}),
	);

	// Ensure nothing in the database changed.
	const found = await repos.entity.findById(directory.entity_id);
	assert.ok(found);
	assert.equal(found.data, directory.data);
});

test_entityServices('create and remove orderedItem entities ', async ({repos, random}) => {
	const {space, actor, account, hub} = await random.space();

	const collectionData1: OrderedCollectionEntityData = {
		type: 'OrderedCollection',
		content: 'this is collection 1',
		orderedItems: [],
	};
	const collectionData2: OrderedCollectionEntityData = {
		type: 'OrderedCollection',
		content: 'this is collection 2',
		orderedItems: [],
	};
	let {entity: collection1} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: collectionData1,
	});
	let {entity: collection2} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: collectionData2,
	});
	const entityData1: NoteEntityData = {content: 'entity: 1'};
	const entityData2: NoteEntityData = {content: 'entity: 2'};
	const entityData3: NoteEntityData = {content: 'entity: 3'};

	const {entity: entity1} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: entityData1,
		ties: [
			{source_id: collection1.entity_id, type: 'HasItem'},
			{source_id: collection2.entity_id, type: 'HasItem'},
		],
	});
	const {entity: entity2} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: entityData2,
		ties: [
			{source_id: collection1.entity_id, type: 'HasItem'},
			{source_id: collection2.entity_id, type: 'HasItem'},
		],
	});
	const {entity: entity3, directories: directories3} = await random.entity(
		actor,
		account,
		hub,
		space,
		space.directory_id,
		{
			data: entityData3,
			ties: [
				{source_id: collection1.entity_id, type: 'HasItem'},
				{source_id: collection2.entity_id, type: 'HasItem'},
			],
		},
	);
	collection1 = directories3.find((e) => e.entity_id === collection1.entity_id)!;
	collection2 = directories3.find((e) => e.entity_id === collection2.entity_id)!;

	assert.is(collection1.data.orderedItems!.length, 3);
	assert.is(collection2.data.orderedItems!.length, 3);
	assert.equal(collection1, await repos.entity.findById(collection1.entity_id));
	assert.equal(collection2, await repos.entity.findById(collection2.entity_id));

	//delete 2nd note; collection should have orderedItem length 2
	const {entities: e1} = unwrap(
		await DeleteEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				entityIds: [entity2.entity_id],
			},
		}),
	);
	collection1 = e1.find((e) => e.entity_id === collection1.entity_id)!;
	collection2 = e1.find((e) => e.entity_id === collection2.entity_id)!;

	assert.is(collection1.data.orderedItems!.length, 2);
	assert.is(collection2.data.orderedItems!.length, 2);
	assert.equal(collection1, await repos.entity.findById(collection1.entity_id));
	assert.equal(collection2, await repos.entity.findById(collection2.entity_id));

	//delete 1 collection; entities should still be present & in other collection
	unwrap(
		await DeleteEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				entityIds: [collection2.entity_id],
			},
		}),
	);
	assert.equal(collection1, await repos.entity.findById(collection1.entity_id));
	assert.equal(entity1, await repos.entity.findById(entity1.entity_id));
	assert.equal(entity3, await repos.entity.findById(entity3.entity_id));

	//delete 2nd collection; entities should be gone now
	unwrap(
		await DeleteEntitiesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				entityIds: [collection1.entity_id],
			},
		}),
	);
	assert.not(await repos.entity.findById(collection1.entity_id));
	assert.not(await repos.entity.findById(entity1.entity_id));
	assert.not(await repos.entity.findById(entity3.entity_id));
	//TODO handle earsures as well
});

test_entityServices.run();
/* test_entityServices */
