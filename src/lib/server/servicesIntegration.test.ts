import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {ReadHubService, DeleteHubService} from '$lib/vocab/hub/hubServices';
import {DeleteSpaceService, ReadSpacesService} from '$lib/vocab/space/spaceServices';
import {ReadEntitiesService} from '$lib/vocab/entity/entityServices';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {
	CreateAssignmentService,
	DeleteAssignmentService,
} from '$lib/vocab/assignment/assignmentServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {ACCOUNT_COLUMNS} from '$lib/vocab/account/accountHelpers.server';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

/* test_servicesIntegration */
const test_servicesIntegration = suite<TestDbContext>('repos');

test_servicesIntegration.before(setupDb);
test_servicesIntegration.after(teardownDb);

test_servicesIntegration('services integration test', async ({repos, random}) => {
	// TODO test cleanup with this:
	// const assertDbCounts = await testDbCounts(repos);

	// create everything
	//
	//
	//
	const account = await random.account();

	// create a actor
	const {actor: actor1} = await random.actor(account);

	// create a second actor
	const {actor: actor2} = await random.actor(account);

	// create hub
	const {hub} = await random.hub(actor1);

	// join the hub with the second actor
	const {assignment} = unwrap(
		await CreateAssignmentService.perform({
			...toServiceRequestMock(repos, actor1), // add `actor2` with `actor1`
			params: {
				actor: actor1.actor_id,
				hub_id: hub.hub_id,
				actor_id: actor2.actor_id,
				role_id: hub.settings.defaultRoleId,
			},
		}),
	);

	// create a space
	const {space} = await random.space(actor1, account, hub);
	const spaceCount = 1;
	const defaultSpaces = toDefaultSpaces(actor1.actor_id, hub);
	const defaultSpaceCount = defaultSpaces.length;

	// create some entities
	const {entity: entity1} = await random.entity(actor1, account, hub, space, space.directory_id);
	const {entity: entity2} = await random.entity(actor1, account, hub, space, space.directory_id);

	// TODO create some ties

	// do queries
	//
	//
	//

	const {entities: filteredEntities} = unwrap(
		await ReadEntitiesService.perform({
			...toServiceRequestMock(repos, actor2),
			params: {actor: actor2.actor_id, source_id: space.directory_id},
		}),
	);
	assert.equal(filteredEntities.slice(), [entity2, entity1]); // `slice` because `RowList` is not deep equal to arrays

	const {spaces: filteredSpaces} = unwrap(
		await ReadSpacesService.perform({
			...toServiceRequestMock(repos, actor2),
			params: {actor: actor2.actor_id, hub_id: hub.hub_id},
		}),
	);
	assert.is(filteredSpaces.length, spaceCount + defaultSpaceCount);

	const {hub: foundHub} = unwrap(
		await ReadHubService.perform({
			...toServiceRequestMock(repos, actor2),
			params: {actor: actor2.actor_id, hub_id: hub.hub_id},
		}),
	);
	assert.is(foundHub.name, hub.name);

	assert.is((await repos.hub.filterByAccount(actor2.account_id)).length, 3);
	assert.is((await repos.hub.filterByActor(actor2.actor_id)).length, 2);

	// TODO add a service action?
	assert.equal(
		(await repos.actor.filterByAccount(account.account_id, ACTOR_COLUMNS.all))
			.sort((a, b) => (a.created < b.created ? -1 : 1))
			.slice(), // `slice` because `RowList` is not deep equal to arrays
		[actor1, actor2],
	);

	// TODO add a service action?
	assert.is(
		(await repos.account.findById(account.account_id, ACCOUNT_COLUMNS.name))?.name,
		account.name,
	);

	// TODO add a service action?
	assert.is(
		(await repos.account.findByName(account.name, ACCOUNT_COLUMNS.name))?.name,
		account.name,
	);

	// do changes
	//
	//
	//

	// Delete one of the two entities, to test that cascading works as expected.
	await repos.entity.deleteByIds([entity1.entity_id]);

	// delete spaces except the home space
	for (const space of filteredSpaces) {
		const directory = (await repos.entity.findById(space.directory_id))!; // eslint-disable-line no-await-in-loop
		if (!isHomeSpace(directory)) {
			unwrap(
				// eslint-disable-next-line no-await-in-loop
				await DeleteSpaceService.perform({
					...toServiceRequestMock(repos, actor2),
					params: {actor: actor1.actor_id, space_id: space.space_id},
				}),
			);
		}
	}
	assert.is((await repos.space.filterByHub(hub.hub_id)).length, 1);

	// delete assignment
	assert.is((await repos.assignment.filterByHub(hub.hub_id)).length, 3);
	unwrap(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, actor2),
			params: {
				actor: actor1.actor_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.is((await repos.assignment.filterByHub(hub.hub_id)).length, 2);
	assert.is(await repos.assignment.countAccountActorAssignmentsByHub(hub.hub_id), 1);

	// delete hub
	//TODO hack to allow for authorization; remove on init default impl
	await repos.policy.create(hub.settings.defaultRoleId, 'delete_hub');
	unwrap(
		await DeleteHubService.perform({
			...toServiceRequestMock(repos, actor1),
			params: {actor: actor1.actor_id, hub_id: hub.hub_id},
		}),
	);
	const readHubResult = await ReadHubService.perform({
		...toServiceRequestMock(repos, actor1),
		params: {actor: actor1.actor_id, hub_id: hub.hub_id},
	});
	assert.is(readHubResult.status, 404);
	assert.is((await repos.assignment.filterByHub(hub.hub_id)).length, 0);

	// TODO delete actors here

	// TODO delete accounts here

	// TODO check counts
	// await assertDbCounts();
});

test_servicesIntegration.run();
/* test_servicesIntegration */
