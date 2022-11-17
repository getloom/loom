import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltcoop/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {randomCommunityParams} from '$lib/util/randomVocab';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {
	DeleteCommunityService,
	CreateCommunityService,
} from '$lib/vocab/community/communityServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {ADMIN_COMMUNITY_ID} from '$lib/app/constants';
import {ReadRolesService} from '$lib/vocab/role/roleServices';

/* test_communityServices */
const test_communityServices = suite<TestDbContext & TestAppContext>('communityRepo');

test_communityServices.before(setupDb);
test_communityServices.after(teardownDb);

test_communityServices('disallow deleting personal community', async ({db, random}) => {
	const {persona} = await random.persona();
	assert.is(
		unwrapError(
			await DeleteCommunityService.perform({
				...toServiceRequestMock(db, persona),
				params: {actor: persona.persona_id, community_id: persona.community_id},
			}),
		).status,
		405,
	);
});

test_communityServices('disallow deleting admin community', async ({db, random}) => {
	const {persona} = await random.persona();
	assert.is(
		unwrapError(
			await DeleteCommunityService.perform({
				...toServiceRequestMock(db, persona),
				params: {actor: persona.persona_id, community_id: ADMIN_COMMUNITY_ID},
			}),
		).status,
		405,
	);
});

test_communityServices('disallow duplicate community names', async ({db, random}) => {
	const {persona} = await random.persona();
	const serviceRequest = toServiceRequestMock(db, persona);

	const params = randomCommunityParams(persona.persona_id);
	params.name += 'Aa';
	unwrap(await CreateCommunityService.perform({...serviceRequest, params}));

	params.name = params.name.toLowerCase();
	assert.is(
		unwrapError(await CreateCommunityService.perform({...serviceRequest, params})).status,
		409,
	);

	params.name = params.name.toUpperCase();
	assert.is(
		unwrapError(await CreateCommunityService.perform({...serviceRequest, params})).status,
		409,
	);
});

test_communityServices('disallow reserved community names', async ({db, random}) => {
	const {persona} = await random.persona();
	const serviceRequest = toServiceRequestMock(db, persona);

	const params = randomCommunityParams(persona.persona_id);
	params.name = 'docs';
	assert.is(
		unwrapError(await CreateCommunityService.perform({...serviceRequest, params})).status,
		409,
	);
});

test_communityServices('new communities have a default role', async ({db, random}) => {
	const {persona} = await random.persona();
	const serviceRequest = toServiceRequestMock(db, persona);

	const params = randomCommunityParams(persona.persona_id);
	const communityResult = unwrap(await CreateCommunityService.perform({...serviceRequest, params}));

	const roleResult = unwrap(
		await ReadRolesService.perform({
			...serviceRequest,
			params: {actor: persona.persona_id, community_id: communityResult.community.community_id},
		}),
	);

	assert.equal(roleResult.roles.length, 1);
	assert.equal(roleResult.roles[0].role_id, communityResult.role.role_id);
	assert.equal(roleResult.roles[0].role_id, communityResult.community.settings.defaultRoleId);
});

test_communityServices('deleted communities cleanup after themselves', async ({db, random}) => {
	const {persona} = await random.persona();
	const {community} = await random.community(persona);
	const serviceRequest = toServiceRequestMock(db, persona);

	unwrap(
		await DeleteCommunityService.perform({
			...serviceRequest,
			params: {actor: persona.persona_id, community_id: community.community_id},
		}),
	);

	//check community personas are gone
	assert.ok(!unwrap(await db.repos.persona.findByCommunityId(community.community_id)));

	//check community spaces are gone
	const spaceResult = unwrap(await db.repos.space.filterByCommunity(community.community_id));
	assert.equal(spaceResult.length, 0);

	//check community assignments are gone
	const assignmentResult = unwrap(
		await db.repos.assignment.filterByCommunityId(community.community_id),
	);
	assert.equal(assignmentResult.length, 0);

	//check roles are gone
	const roleResult = unwrap(await db.repos.role.filterByCommunityId(community.community_id));
	assert.equal(roleResult.length, 0);

	//check community is gone
	assert.ok(!unwrap(await db.repos.community.findById(community.community_id)));
});

test_communityServices.run();
/* test_communityServices */
