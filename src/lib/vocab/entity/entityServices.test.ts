import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {NoteEntityData} from '$lib/vocab/entity/entityData';
import {expectApiError, toServiceRequestMock} from '$lib/util/testHelpers';
import {
	ReadEntitiesPaginatedService,
	DeleteEntitiesService,
	CreateEntityService,
	UpdateEntitiesService,
	EraseEntitiesService,
} from '$lib/vocab/entity/entityServices';
import {DEFAULT_PAGE_SIZE} from '$lib/app/constants';
import {validateSchema} from '$lib/util/ajv';
import {InviteToHubService} from '$lib/vocab/hub/hubServices';
import {performService} from '$lib/server/service';
import type {AccountActor} from '$lib/vocab/actor/actor';

/* test_entityServices */
const test_entityServices = suite<TestDbContext>('hubRepo');

test_entityServices.before(setupDb);
test_entityServices.after(teardownDb);

test_entityServices('create entities with data', async ({random}) => {
	const {space, actor, account, hub} = await random.space();

	const entityData1: NoteEntityData = {type: 'Note', content: 'this is entity 1'};
	const entityData2: NoteEntityData = {type: 'Note', content: 'entity: 2'};
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

	const entityData = {type: 'Note', content: 'test'} as const;
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
	const {entities: filtered} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			...toServiceRequestMock(repos, actor),
			params: {actor: actor.actor_id, source_id: space.directory_id},
		}),
	);

	assert.is(filtered.length, 0);

	const entities = (
		await Promise.all(
			Array.from({length: DEFAULT_PAGE_SIZE + 1}, (_, i) =>
				random.entity(actor, account, hub, space, space.directory_id, {
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
			...toServiceRequestMock(repos, actor),
			params: {actor: actor.actor_id, source_id: space.directory_id},
		}),
	);
	assert.is(filtered2.length, DEFAULT_PAGE_SIZE);
	assert.equal(filtered2.slice(), entities.slice(0, -1));

	const FIRST_PAGE_SIZE = Math.floor(DEFAULT_PAGE_SIZE / 2);
	const SECOND_PAGE_SIZE = Math.ceil(DEFAULT_PAGE_SIZE / 2);

	//then do 3 queries on smaller pages
	const {entities: filtered3} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				source_id: space.directory_id,
				pageSize: FIRST_PAGE_SIZE,
			},
		}),
	);

	assert.is(filtered3.length, FIRST_PAGE_SIZE);

	const {entities: filtered4} = unwrap(
		await ReadEntitiesPaginatedService.perform({
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

	const {entities: filtered5} = unwrap(
		await ReadEntitiesPaginatedService.perform({
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

	assert.equal(filtered3.concat(filtered4).concat(filtered5), entities);
});

//TODO move to action tests if/when that happens
test_entityServices('assert default as max pageSize', async ({random}) => {
	const {space} = await random.space();

	const validateParams = validateSchema(ReadEntitiesPaginatedService.action.params);
	assert.ok(!validateParams({source_id: space.directory_id, pageSize: DEFAULT_PAGE_SIZE + 1}));
});

test_entityServices('deleting entities and cleaning orphans', async ({random, repos}) => {
	const {space, actor, account, hub} = await random.space();
	//generate a collection with 3 notes
	const {entity: list} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: {type: 'Collection', content: `grocery list`},
	});
	const {entity: todo1} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: {type: 'Note', content: `eggs`},
		ties: [{source_id: list.entity_id}],
	});
	const {entity: todo2} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: {type: 'Note', content: `bread`},
		ties: [{source_id: list.entity_id}],
	});
	const {entity: todo3} = await random.entity(actor, account, hub, space, space.directory_id, {
		data: {type: 'Note', content: `milk`},
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

		unwrap(
			await InviteToHubService.perform({
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					hub_id: hub.hub_id,
					name: actor2.name,
				},
			}),
		);

		//case 1, actor === actor in regular space | allowed
		const note1 = unwrap(
			await CreateEntityService.perform({
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					data: {type: 'Note', content: 'note1'},
					space_id: space.space_id,
				},
			}),
		).entities[0];

		unwrap(
			await UpdateEntitiesService.perform({
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					entities: [{entity_id: note1.entity_id, data: {type: 'Note', content: 'Note1'}}],
				},
			}),
		);

		//case 2, actor === actor in common space | allowed
		const note2 = unwrap(
			await CreateEntityService.perform({
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					data: {type: 'Note', content: 'note2'},
					space_id: commonSpace.space_id,
				},
			}),
		).entities[0];

		unwrap(
			await UpdateEntitiesService.perform({
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					entities: [{entity_id: note2.entity_id, data: {type: 'Note', content: 'Note2'}}],
				},
			}),
		);

		//case 3, actor !== actor in common space | allowed
		unwrap(
			await UpdateEntitiesService.perform({
				...toServiceRequestMock(repos, actor2),
				params: {
					actor: actor2.actor_id,
					entities: [{entity_id: note2.entity_id, data: {type: 'Note', content: 'lol'}}],
				},
			}),
		);

		//case 4, actor !== actor in regular space | block
		await expectApiError(403, () =>
			UpdateEntitiesService.perform({
				...toServiceRequestMock(repos, actor2),
				params: {
					actor: actor2.actor_id,
					entities: [{entity_id: note1.entity_id, data: {type: 'Note', content: 'lol'}}],
				},
			}),
		);
	},
);

test_entityServices.only('disallow mutating directory', async ({repos, random}) => {
	const {actor, hubActor} = await random.hub();
	const {directory} = await random.space(actor);

	assert.is(directory.data.type, 'Collection');
	assert.ok(directory.data.directory);

	const mutateDirectory = async (actor: AccountActor) => {
		// Disallow changing the directory's type
		unwrapError(
			await performService(UpdateEntitiesService, {
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					entity_id: directory.entity_id,
					data: {type: 'Note', content: 'test'},
				},
			}),
		);

		// Disallow removing `data.directory`
		unwrapError(
			await performService(UpdateEntitiesService, {
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					entity_id: directory.entity_id,
					data: {type: 'Collection'},
				},
			}),
		);

		// Disallow changing `data.directory`
		unwrapError(
			await performService(UpdateEntitiesService, {
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					entity_id: directory.entity_id,
					data: {type: 'Collection', directory: false as any},
				},
			}),
		);

		// Disallow deleting the directory
		unwrapError(
			await performService(DeleteEntitiesService, {
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					entityIds: [directory.entity_id],
				},
			}),
		);

		// Disallow erasing the directory
		unwrapError(
			await performService(EraseEntitiesService, {
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
	};

	await mutateDirectory(actor);
	await mutateDirectory(hubActor as AccountActor); // TODO this casting is a problem, the API expects an `AccountActor` but we're sending a `PublicActor` in this case
});

test_entityServices.run();
/* test_entityServices */
