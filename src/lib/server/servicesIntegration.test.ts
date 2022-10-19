import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {
	ReadCommunitiesService,
	ReadCommunityService,
	DeleteCommunityService,
} from '$lib/vocab/community/communityServices';
import {
	DeleteSpaceService,
	ReadSpaceService,
	ReadSpacesService,
} from '$lib/vocab/space/spaceServices';
import {ReadEntitiesService} from '$lib/vocab/entity/entityServices';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {
	CreateAssignmentService,
	DeleteAssignmentService,
} from '$lib/vocab/assignment/assignmentServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';

/* test_servicesIntegration */
const test_servicesIntegration = suite<TestDbContext>('repos');

test_servicesIntegration.before(setupDb);
test_servicesIntegration.after(teardownDb);

test_servicesIntegration('services integration test', async ({db, random}) => {
	// create everything
	//
	//
	//
	const account = await random.account();

	// create a persona
	const {persona: persona1} = await random.persona(account);

	// create a second persona
	const {persona: persona2} = await random.persona(account);

	const serviceRequest1 = toServiceRequestMock(db, persona1);
	const serviceRequest2 = toServiceRequestMock(db, persona2);

	// create community
	const {community} = await random.community(persona1);

	// join the community with the second persona
	unwrap(
		await CreateAssignmentService.perform({
			...serviceRequest1, // add `persona2` with `persona1`
			params: {
				actor: persona2.persona_id,
				community_id: community.community_id,
				persona_id: persona2.persona_id,
			},
		}),
	);

	// create a space
	const {space} = await random.space(persona1, account, community);
	const spaceCount = 1;
	const defaultSpaces = toDefaultSpaces(persona1.persona_id, community);
	const defaultSpaceCount = defaultSpaces.length;

	// create some entities
	const {entity: entity1} = await random.entity(persona1, account, community, space.directory_id);
	const {entity: entity2} = await random.entity(persona1, account, community, space.directory_id);

	// TODO create some ties

	// do queries
	//
	//
	//

	const {entities: filteredEntities} = unwrap(
		await ReadEntitiesService.perform({
			...serviceRequest2,
			params: {actor: persona2.persona_id, source_id: space.directory_id},
		}),
	);
	assert.equal(filteredEntities.slice(), [entity2, entity1]); // `slice` because `RowList` is not deep equal to arrays

	const {space: foundSpace} = unwrap(
		await ReadSpaceService.perform({
			...serviceRequest2,
			params: {actor: persona2.persona_id, space_id: space.space_id},
		}),
	);
	assert.equal(foundSpace, space);

	const {spaces: filteredSpaces} = unwrap(
		await ReadSpacesService.perform({
			...serviceRequest2,
			params: {actor: persona2.persona_id, community_id: community.community_id},
		}),
	);
	assert.is(filteredSpaces.length, spaceCount + defaultSpaceCount);

	const {community: foundCommunity} = unwrap(
		await ReadCommunityService.perform({
			...serviceRequest2,
			params: {actor: persona2.persona_id, community_id: community.community_id},
		}),
	);
	assert.is(foundCommunity.name, community.name);

	const {communities: filteredCommunities} = unwrap(
		await ReadCommunitiesService.perform({
			...serviceRequest2,
			params: {actor: persona2.persona_id},
		}),
	);
	assert.is(filteredCommunities.length, 3);

	// TODO add a service event?
	assert.equal(
		unwrap(await db.repos.persona.filterByAccount(account.account_id))
			.sort((a, b) => (a.created < b.created ? -1 : 1))
			.slice(), // `slice` because `RowList` is not deep equal to arrays
		[persona1, persona2],
	);

	// TODO add a service event?
	assert.is(unwrap(await db.repos.account.findById(account.account_id))?.name, account.name);

	// TODO add a service event?
	assert.is(unwrap(await db.repos.account.findByName(account.name))?.name, account.name);

	// do changes
	//
	//
	//

	// TODO delete entities here

	// delete spaces except the home space
	for (const space of filteredSpaces) {
		if (!isHomeSpace(space)) {
			unwrap(
				// eslint-disable-next-line no-await-in-loop
				await DeleteSpaceService.perform({
					...serviceRequest2,
					params: {actor: persona2.persona_id, space_id: space.space_id},
				}),
			);
		}
	}
	assert.is(unwrap(await db.repos.space.filterByCommunity(community.community_id)).length, 1);

	// delete assignment
	assert.is(
		unwrap(await db.repos.assignment.filterByCommunityId(community.community_id)).length,
		3,
	);
	unwrap(
		await DeleteAssignmentService.perform({
			...serviceRequest2,
			params: {
				actor: persona2.persona_id,
				persona_id: persona2.persona_id,
				community_id: community.community_id,
			},
		}),
	);
	assert.is(
		unwrap(await db.repos.assignment.filterByCommunityId(community.community_id)).length,
		2,
	);
	assert.is(
		unwrap(
			await db.repos.assignment.filterAccountPersonaAssignmentsByCommunityId(
				community.community_id,
			),
		).length,
		1,
	);

	// delete community
	unwrap(
		await DeleteCommunityService.perform({
			...serviceRequest1,
			params: {actor: persona1.persona_id, community_id: community.community_id},
		}),
	);
	const readCommunityResult = await ReadCommunityService.perform({
		...serviceRequest1,
		params: {actor: persona1.persona_id, community_id: community.community_id},
	});
	assert.is(readCommunityResult.status, 404);
	assert.is(
		unwrap(await db.repos.assignment.filterByCommunityId(community.community_id)).length,
		0,
	);

	// TODO delete personas here

	// TODO delete accounts here

	// TODO check to be sure the database has the same # rows in each table as when this test started --
	// maybe do this with before/after hooks so it's easily reused?
});

test_servicesIntegration.run();
/* test_servicesIntegration */
