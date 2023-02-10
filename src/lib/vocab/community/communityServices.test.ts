import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {randomCommunityParams} from '$lib/util/randomVocab';
import {
	DeleteCommunityService,
	CreateCommunityService,
} from '$lib/vocab/community/communityServices';
import {loadAdminPersona, toServiceRequestMock} from '$lib/util/testHelpers';
import {ADMIN_COMMUNITY_ID} from '$lib/app/constants';
import {ReadRolesService} from '$lib/vocab/role/roleServices';
import {permissionNames, permissions} from '$lib/vocab/policy/permissions';
import {ReadPoliciesService} from '$lib/vocab/policy/policyServices';
import type {Policy} from '$lib/vocab/policy/policy';
import type {Role} from '$lib/vocab/role/role';

const sortedPermissionNames = permissionNames.slice().sort();
const toSortedPermissionNames = (policies: Policy[]) => policies.map((p) => p.permission).sort();
const toSortedRoles = (roles: Role[]) => roles.slice().sort((a, b) => a.role_id - b.role_id);

/* test_communityServices */
const test_communityServices = suite<TestDbContext>('communityRepo');

test_communityServices.before(setupDb);
test_communityServices.after(teardownDb);

test_communityServices('disallow deleting personal community', async ({db, random}) => {
	const {persona, personalCommunity} = await random.persona();
	//TODO hack to allow for authorization; remove on init default impl
	unwrap(
		await db.repos.policy.create(
			personalCommunity.settings.defaultRoleId,
			permissions.DeleteCommunity,
		),
	);
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

	const adminCommunity = unwrap(await db.repos.community.findById(ADMIN_COMMUNITY_ID))!;
	unwrap(
		await db.repos.assignment.create(
			persona.persona_id,
			ADMIN_COMMUNITY_ID,
			adminCommunity.settings.defaultRoleId,
		),
	);

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

test_communityServices('default admin community role has all permissions', async ({db}) => {
	const adminCommunity = unwrap(await db.repos.community.findById(ADMIN_COMMUNITY_ID))!;
	const adminDefaultPolicies = unwrap(
		await db.repos.policy.filterByRole(adminCommunity.settings.defaultRoleId),
	);

	assert.equal(toSortedPermissionNames(adminDefaultPolicies), sortedPermissionNames);
});

test_communityServices(
	'default personal community role has all permissions',
	async ({db, random}) => {
		const {persona} = await random.persona();

		const personalCommunity = unwrap(await db.repos.community.findById(persona.community_id))!;
		const personalDefaultPolicies = unwrap(
			await db.repos.policy.filterByRole(personalCommunity.settings.defaultRoleId),
		);

		assert.equal(toSortedPermissionNames(personalDefaultPolicies), sortedPermissionNames);
	},
);

test_communityServices('disallow duplicate community names', async ({db, random}) => {
	const {persona} = await random.persona();

	const params = randomCommunityParams(persona.persona_id);
	params.template.name += 'Aa';
	unwrap(await CreateCommunityService.perform({...toServiceRequestMock(db, persona), params}));

	params.template.name = params.template.name.toLowerCase();
	assert.is(
		unwrapError(
			await CreateCommunityService.perform({...toServiceRequestMock(db, persona), params}),
		).status,
		409,
	);

	params.template.name = params.template.name.toUpperCase();
	assert.is(
		unwrapError(
			await CreateCommunityService.perform({...toServiceRequestMock(db, persona), params}),
		).status,
		409,
	);
});

test_communityServices('disallow reserved community names', async ({db, random}) => {
	const {persona} = await random.persona();

	const params = randomCommunityParams(persona.persona_id);
	params.template.name = 'docs';
	assert.is(
		unwrapError(
			await CreateCommunityService.perform({...toServiceRequestMock(db, persona), params}),
		).status,
		409,
	);
});

test_communityServices(
	'new communities have default template roles & policies',
	async ({db, random}) => {
		const {persona} = await random.persona();

		const params = randomCommunityParams(persona.persona_id);
		const communityResult = unwrap(
			await CreateCommunityService.perform({...toServiceRequestMock(db, persona), params}),
		);

		const roleResult = unwrap(
			await ReadRolesService.perform({
				...toServiceRequestMock(db, persona),
				params: {actor: persona.persona_id, community_id: communityResult.community.community_id},
			}),
		);
		assert.is(roleResult.roles.length, 2);
		assert.equal(toSortedRoles(roleResult.roles), toSortedRoles(communityResult.roles));
		assert.ok(
			roleResult.roles.find((r) => r.role_id === communityResult.community.settings.defaultRoleId),
		);

		const stewardPolicyResults = unwrap(
			await ReadPoliciesService.perform({
				...toServiceRequestMock(db, persona),
				params: {actor: persona.persona_id, role_id: communityResult.roles[0].role_id},
			}),
		);
		assert.equal(toSortedPermissionNames(stewardPolicyResults.policies), sortedPermissionNames);

		const memberPolicyResults = unwrap(
			await ReadPoliciesService.perform({
				...toServiceRequestMock(db, persona),
				params: {actor: persona.persona_id, role_id: communityResult.roles[1].role_id},
			}),
		);
		assert.is(memberPolicyResults.policies.length, 5);
	},
);

test_communityServices('deleted communities cleanup after themselves', async ({db, random}) => {
	const {persona} = await random.persona();
	const {community} = await random.community(persona);

	//TODO hack to allow for authorization; remove on init default impl
	unwrap(
		await db.repos.policy.create(community.settings.defaultRoleId, permissions.DeleteCommunity),
	);

	unwrap(
		await DeleteCommunityService.perform({
			...toServiceRequestMock(db, persona),
			params: {actor: persona.persona_id, community_id: community.community_id},
		}),
	);

	//check community personas are gone
	assert.ok(!unwrap(await db.repos.persona.findByCommunity(community.community_id)));

	//check community spaces are gone
	const spaceResult = unwrap(await db.repos.space.filterByCommunity(community.community_id));
	assert.is(spaceResult.length, 0);

	//check community assignments are gone
	const assignmentResult = unwrap(
		await db.repos.assignment.filterByCommunity(community.community_id),
	);
	assert.is(assignmentResult.length, 0);

	//check roles are gone
	const roleResult = unwrap(await db.repos.role.filterByCommunity(community.community_id));
	assert.is(roleResult.length, 0);

	//check community is gone
	assert.ok(!unwrap(await db.repos.community.findById(community.community_id)));
});

test_communityServices(
	'when new communities are disabled, only admins should be able to create new ones',
	async ({db, random}) => {
		const {persona} = await random.persona();

		const {settings} = unwrap(await db.repos.community.findById(ADMIN_COMMUNITY_ID))!;
		const settingValue = settings.instance?.disableCreateCommunity;
		unwrap(
			await db.repos.community.updateSettings(ADMIN_COMMUNITY_ID, {
				...settings,
				instance: {...settings.instance, disableCreateCommunity: true},
			}),
		);

		unwrapError(
			await CreateCommunityService.perform({
				...toServiceRequestMock(db, persona),
				params: randomCommunityParams(persona.persona_id),
			}),
		);

		const actor = await loadAdminPersona(db.repos);

		unwrap(
			await CreateCommunityService.perform({
				...toServiceRequestMock(db, persona),
				params: randomCommunityParams(actor.persona_id),
			}),
		);

		//cleanup from test; do not delete
		unwrap(
			await db.repos.community.updateSettings(ADMIN_COMMUNITY_ID, {
				...settings,
				instance: {...settings.instance, disableCreateCommunity: settingValue},
			}),
		);
	},
);

test_communityServices.run();
/* test_communityServices */
