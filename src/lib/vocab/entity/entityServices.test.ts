import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import type {NoteEntityData} from '$lib/vocab/entity/entityData';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {
	ReadEntitiesPaginatedService,
	DeleteEntitiesService,
} from '$lib/vocab/entity/entityServices';
import {DEFAULT_PAGE_SIZE} from '$lib/app/constants';
import {validateSchema} from '$lib/util/ajv';

/* test_entityServices */
const test_entityServices = suite<TestDbContext & TestAppContext>('communityRepo');

test_entityServices.before(setupDb);
test_entityServices.after(teardownDb);

test_entityServices('create entities with data', async ({random}) => {
	const {space, persona, account, community} = await random.space();

	const entityData1: NoteEntityData = {type: 'Note', content: 'this is entity 1'};
	const entityData2: NoteEntityData = {type: 'Note', content: 'entity: 2'};
	const {entity: entity1, ties: ties1} = await random.entity(
		persona,
		account,
		community,
		space.directory_id,
		{data: entityData1},
	);
	const {entity: entity2, ties: ties2} = await random.entity(
		persona,
		account,
		community,
		space.directory_id,
		{data: entityData2},
	);
	assert.is(entity1.persona_id, persona.persona_id);
	assert.is(entity2.persona_id, persona.persona_id);
	assert.equal(entity1.data, entityData1);
	assert.equal(entity2.data, entityData2);
	assert.is(ties1.length, 1);
	assert.is(ties2.length, 1);
	assert.is(ties1[0].source_id, ties2[0].source_id);
	assert.is(ties1[0].source_id, space.directory_id);
	assert.is(ties1[0].dest_id, entity1.entity_id);
	assert.is(ties2[0].dest_id, entity2.entity_id);
});

test_entityServices('read paginated entities by source_id', async ({db, random}) => {
	const {space, persona, account, community} = await random.space();
	const serviceRequest = toServiceRequestMock(db, persona);

	//first query on the space dir and expect an empty set
	const {entities: filtered} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			...serviceRequest,
			params: {actor: persona.persona_id, source_id: space.directory_id},
		}),
	);

	assert.is(filtered.length, 0);

	const entities = (
		await Promise.all(
			Array.from({length: DEFAULT_PAGE_SIZE + 1}, (_, i) =>
				random.entity(persona, account, community, space.directory_id, {
					data: {type: 'Note', content: `This is note ${i}`},
				}),
			),
		)
	)
		.map((v) => v.entity)
		.sort((a, b) => b.entity_id - a.entity_id);

	//test the default param returns properly
	const {entities: filtered2} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			...serviceRequest,
			params: {actor: persona.persona_id, source_id: space.directory_id},
		}),
	);
	assert.is(filtered2.length, DEFAULT_PAGE_SIZE);
	assert.equal(filtered2.slice(), entities.slice(0, -1));

	const FIRST_PAGE_SIZE = Math.floor(DEFAULT_PAGE_SIZE / 2);
	const SECOND_PAGE_SIZE = Math.ceil(DEFAULT_PAGE_SIZE / 2);

	//then do 3 queries on smaller pages
	const {entities: filtered3} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			...serviceRequest,
			params: {actor: persona.persona_id, source_id: space.directory_id, pageSize: FIRST_PAGE_SIZE},
		}),
	);

	assert.is(filtered3.length, FIRST_PAGE_SIZE);

	const {entities: filtered4} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			...serviceRequest,
			params: {
				actor: persona.persona_id,
				source_id: space.directory_id,
				pageSize: SECOND_PAGE_SIZE,
				pageKey: filtered3.at(-1)!.entity_id,
			},
		}),
	);

	assert.is(filtered4.length, SECOND_PAGE_SIZE);
	assert.ok(!filtered3.find((v) => v.entity_id === filtered4[0].entity_id));

	const {entities: filtered5} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			...serviceRequest,
			params: {
				actor: persona.persona_id,
				source_id: space.directory_id,
				pageSize: SECOND_PAGE_SIZE,
				pageKey: filtered4.at(-1)!.entity_id,
			},
		}),
	);
	assert.is(filtered5.length, 1);

	assert.equal(filtered3.concat(filtered4).concat(filtered5), entities);
});

//TODO move to event tests if/when that happens
test_entityServices('assert default as max pageSize', async ({random}) => {
	const {space} = await random.space();

	const validateParams = validateSchema(ReadEntitiesPaginatedService.event.params);
	assert.ok(!validateParams({source_id: space.directory_id, pageSize: DEFAULT_PAGE_SIZE + 1}));
});

test_entityServices('deleting entities and cleaning orphans', async ({random, db}) => {
	const {space, persona, account, community} = await random.space();
	const serviceRequest = toServiceRequestMock(db, persona);
	//generate a collection with 3 notes
	const {entity: list} = await random.entity(persona, account, community, space.directory_id, {
		data: {type: 'Collection', name: `grocery list`},
	});
	const {entity: todo1} = await random.entity(persona, account, community, space.directory_id, {
		data: {type: 'Note', content: `eggs`},
		ties: [{source_id: list.entity_id}],
	});
	const {entity: todo2} = await random.entity(persona, account, community, space.directory_id, {
		data: {type: 'Note', content: `bread`},
		ties: [{source_id: list.entity_id}],
	});
	const {entity: todo3} = await random.entity(persona, account, community, space.directory_id, {
		data: {type: 'Note', content: `milk`},
		ties: [{source_id: list.entity_id}],
	});
	const entityIds = [todo1.entity_id, todo2.entity_id, todo3.entity_id];
	const filterResult = unwrap(await db.repos.entity.filterByIds(entityIds));
	assert.is(filterResult.entities.length, 3);
	assert.is(filterResult.missing, null);
	//delete the collection
	unwrap(
		await DeleteEntitiesService.perform({
			...serviceRequest,
			params: {actor: persona.persona_id, entityIds: [list.entity_id]},
		}),
	);
	const {missing} = unwrap(await db.repos.entity.filterByIds(entityIds));
	assert.equal(missing, entityIds);
});

test_entityServices.run();
/* test_entityServices */
