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
import {permissions} from '$lib/vocab/policy/permissions';

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

	// create a persona
	const {persona: persona1} = await random.persona(account);

	// create a second persona
	const {persona: persona2} = await random.persona(account);

	// create hub
	const {hub} = await random.hub(persona1);

	// join the hub with the second persona
	const {assignment} = unwrap(
		await CreateAssignmentService.perform({
			...toServiceRequestMock(repos, persona1), // add `persona2` with `persona1`
			params: {
				actor: persona1.persona_id,
				hub_id: hub.hub_id,
				targetActor: persona2.persona_id,
				role_id: hub.settings.defaultRoleId,
			},
		}),
	);

	// create a space
	const {space} = await random.space(persona1, account, hub);
	const spaceCount = 1;
	const defaultSpaces = toDefaultSpaces(persona1.persona_id, hub);
	const defaultSpaceCount = defaultSpaces.length;

	// create some entities
	const {entity: entity1} = await random.entity(persona1, account, hub, space, space.directory_id);
	const {entity: entity2} = await random.entity(persona1, account, hub, space, space.directory_id);

	// TODO create some ties

	// do queries
	//
	//
	//

	const {entities: filteredEntities} = unwrap(
		await ReadEntitiesService.perform({
			...toServiceRequestMock(repos, persona2),
			params: {actor: persona2.persona_id, source_id: space.directory_id},
		}),
	);
	assert.equal(filteredEntities.slice(), [entity2, entity1]); // `slice` because `RowList` is not deep equal to arrays

	const {spaces: filteredSpaces} = unwrap(
		await ReadSpacesService.perform({
			...toServiceRequestMock(repos, persona2),
			params: {actor: persona2.persona_id, hub_id: hub.hub_id},
		}),
	);
	assert.is(filteredSpaces.length, spaceCount + defaultSpaceCount);

	const {hub: foundHub} = unwrap(
		await ReadHubService.perform({
			...toServiceRequestMock(repos, persona2),
			params: {actor: persona2.persona_id, hub_id: hub.hub_id},
		}),
	);
	assert.is(foundHub.name, hub.name);

	assert.is(unwrap(await repos.hub.filterByAccount(persona2.account_id)).length, 3);
	assert.is(unwrap(await repos.hub.filterByPersona(persona2.persona_id)).length, 2);

	// TODO add a service event?
	assert.equal(
		unwrap(await repos.persona.filterByAccount(account.account_id))
			.sort((a, b) => (a.created < b.created ? -1 : 1))
			.slice(), // `slice` because `RowList` is not deep equal to arrays
		[persona1, persona2],
	);

	// TODO add a service event?
	assert.is(unwrap(await repos.account.findById(account.account_id))?.name, account.name);

	// TODO add a service event?
	assert.is(unwrap(await repos.account.findByName(account.name))?.name, account.name);

	// do changes
	//
	//
	//

	// Delete one of the two entities, to test that cascading works as expected.
	unwrap(await repos.entity.deleteByIds([entity1.entity_id]));

	// delete spaces except the home space
	for (const space of filteredSpaces) {
		const directory = unwrap(await repos.entity.findById(space.directory_id))!; // eslint-disable-line no-await-in-loop
		if (!isHomeSpace(directory)) {
			unwrap(
				// eslint-disable-next-line no-await-in-loop
				await DeleteSpaceService.perform({
					...toServiceRequestMock(repos, persona2),
					params: {actor: persona1.persona_id, space_id: space.space_id},
				}),
			);
		}
	}
	assert.is(unwrap(await repos.space.filterByHub(hub.hub_id)).length, 1);

	// delete assignment
	assert.is(unwrap(await repos.assignment.filterByHub(hub.hub_id)).length, 3);
	unwrap(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, persona2),
			params: {
				actor: persona1.persona_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.is(unwrap(await repos.assignment.filterByHub(hub.hub_id)).length, 2);
	assert.is(unwrap(await repos.assignment.countAccountPersonaAssignmentsByHubId(hub.hub_id)), 1);

	// delete hub
	//TODO hack to allow for authorization; remove on init default impl
	unwrap(await repos.policy.create(hub.settings.defaultRoleId, permissions.DeleteHub));
	unwrap(
		await DeleteHubService.perform({
			...toServiceRequestMock(repos, persona1),
			params: {actor: persona1.persona_id, hub_id: hub.hub_id},
		}),
	);
	const readHubResult = await ReadHubService.perform({
		...toServiceRequestMock(repos, persona1),
		params: {actor: persona1.persona_id, hub_id: hub.hub_id},
	});
	assert.is(readHubResult.status, 404);
	assert.is(unwrap(await repos.assignment.filterByHub(hub.hub_id)).length, 0);

	// TODO delete personas here

	// TODO delete accounts here

	// TODO check counts
	// await assertDbCounts();
});

test_servicesIntegration.run();
/* test_servicesIntegration */
