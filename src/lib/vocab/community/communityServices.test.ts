import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {randomCommunityParams} from '$lib/util/randomVocab';
import {
	DeleteCommunityService,
	CreateCommunityService,
	KickFromCommunityService,
	LeaveCommunityService,
	InviteToCommunityService,
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

test_communityServices('disallow deleting personal community', async ({repos, random}) => {
	const {persona, personalCommunity} = await random.persona();
	//TODO hack to allow for authorization; remove on init default impl
	unwrap(
		await repos.policy.create(
			personalCommunity.settings.defaultRoleId,
			permissions.DeleteCommunity,
		),
	);
	assert.is(
		unwrapError(
			await DeleteCommunityService.perform({
				...toServiceRequestMock(repos, persona),
				params: {actor: persona.persona_id, community_id: persona.community_id},
			}),
		).status,
		405,
	);
});

test_communityServices('disallow deleting admin community', async ({repos}) => {
	const adminPersona = await loadAdminPersona(repos);
	assert.is(
		unwrapError(
			await DeleteCommunityService.perform({
				...toServiceRequestMock(repos, adminPersona),
				params: {actor: adminPersona.persona_id, community_id: ADMIN_COMMUNITY_ID},
			}),
		).status,
		405,
	);
});

test_communityServices('default admin community role has all permissions', async ({repos}) => {
	const adminCommunity = await repos.community.loadAdminCommunity();
	const adminDefaultPolicies = unwrap(
		await repos.policy.filterByRole(adminCommunity.settings.defaultRoleId),
	);

	assert.equal(toSortedPermissionNames(adminDefaultPolicies), sortedPermissionNames);
});

test_communityServices(
	'default personal community role has all permissions',
	async ({repos, random}) => {
		const {persona} = await random.persona();

		const personalCommunity = unwrap(await repos.community.findById(persona.community_id))!;
		const personalDefaultPolicies = unwrap(
			await repos.policy.filterByRole(personalCommunity.settings.defaultRoleId),
		);

		assert.equal(toSortedPermissionNames(personalDefaultPolicies), sortedPermissionNames);
	},
);

test_communityServices('disallow duplicate community names', async ({repos, random}) => {
	const {persona} = await random.persona();

	const params = randomCommunityParams(persona.persona_id);
	params.template.name += 'Aa';
	unwrap(await CreateCommunityService.perform({...toServiceRequestMock(repos, persona), params}));

	params.template.name = params.template.name.toLowerCase();
	assert.is(
		unwrapError(
			await CreateCommunityService.perform({...toServiceRequestMock(repos, persona), params}),
		).status,
		409,
	);

	params.template.name = params.template.name.toUpperCase();
	assert.is(
		unwrapError(
			await CreateCommunityService.perform({...toServiceRequestMock(repos, persona), params}),
		).status,
		409,
	);
});

test_communityServices('disallow reserved community names', async ({repos, random}) => {
	const {persona} = await random.persona();

	const params = randomCommunityParams(persona.persona_id);
	params.template.name = 'docs';
	assert.is(
		unwrapError(
			await CreateCommunityService.perform({...toServiceRequestMock(repos, persona), params}),
		).status,
		409,
	);
});

test_communityServices(
	'new communities have default template roles & policies',
	async ({repos, random}) => {
		const {persona} = await random.persona();

		const params = randomCommunityParams(persona.persona_id);
		const communityResult = unwrap(
			await CreateCommunityService.perform({...toServiceRequestMock(repos, persona), params}),
		);

		const roleResult = unwrap(
			await ReadRolesService.perform({
				...toServiceRequestMock(repos, persona),
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
				...toServiceRequestMock(repos, persona),
				params: {actor: persona.persona_id, role_id: communityResult.roles[0].role_id},
			}),
		);
		assert.equal(toSortedPermissionNames(stewardPolicyResults.policies), sortedPermissionNames);

		const memberPolicyResults = unwrap(
			await ReadPoliciesService.perform({
				...toServiceRequestMock(repos, persona),
				params: {actor: persona.persona_id, role_id: communityResult.roles[1].role_id},
			}),
		);
		assert.is(memberPolicyResults.policies.length, 5);
	},
);

test_communityServices('deleted communities cleanup after themselves', async ({repos, random}) => {
	const {persona} = await random.persona();
	const {community} = await random.community(persona);

	//TODO hack to allow for authorization; remove on init default impl
	unwrap(await repos.policy.create(community.settings.defaultRoleId, permissions.DeleteCommunity));

	unwrap(
		await DeleteCommunityService.perform({
			...toServiceRequestMock(repos, persona),
			params: {actor: persona.persona_id, community_id: community.community_id},
		}),
	);

	//check community personas are gone
	assert.ok(!unwrap(await repos.persona.findByCommunity(community.community_id)));

	//check community spaces are gone
	const spaceResult = unwrap(await repos.space.filterByCommunity(community.community_id));
	assert.is(spaceResult.length, 0);

	//check community assignments are gone
	const assignmentResult = unwrap(await repos.assignment.filterByCommunity(community.community_id));
	assert.is(assignmentResult.length, 0);

	//check roles are gone
	const roleResult = unwrap(await repos.role.filterByCommunity(community.community_id));
	assert.is(roleResult.length, 0);

	//check community is gone
	assert.ok(!unwrap(await repos.community.findById(community.community_id)));
});

test_communityServices(
	'when new communities are disabled, only admins should be able to create new ones',
	async ({repos, random}) => {
		const {persona} = await random.persona();

		const {settings} = await repos.community.loadAdminCommunity();
		const settingValue = settings.instance?.disableCreateCommunity;
		unwrap(
			await repos.community.updateSettings(ADMIN_COMMUNITY_ID, {
				...settings,
				instance: {...settings.instance, disableCreateCommunity: true},
			}),
		);

		unwrapError(
			await CreateCommunityService.perform({
				...toServiceRequestMock(repos, persona),
				params: randomCommunityParams(persona.persona_id),
			}),
		);

		const actor = await loadAdminPersona(repos);

		unwrap(
			await CreateCommunityService.perform({
				...toServiceRequestMock(repos, persona),
				params: randomCommunityParams(actor.persona_id),
			}),
		);

		//cleanup from test; do not delete
		unwrap(
			await repos.community.updateSettings(ADMIN_COMMUNITY_ID, {
				...settings,
				instance: {...settings.instance, disableCreateCommunity: settingValue},
			}),
		);
	},
);

test_communityServices(
	'InviteToCommunity assigns the default community role to the persona',
	async ({repos, random}) => {
		const {persona} = await random.persona();
		const {community, persona: communityPersona} = await random.community();
		unwrap(
			await InviteToCommunityService.perform({
				...toServiceRequestMock(repos, communityPersona),
				params: {
					actor: communityPersona.persona_id,
					community_id: community.community_id,
					name: persona.name,
				},
			}),
		);
	},
);

test_communityServices(
	'fail InviteToCommunity when the persona already has an assignment',
	async ({repos, random}) => {
		const {persona} = await random.persona();
		const {community, persona: communityPersona} = await random.community();
		unwrap(
			await repos.assignment.create(
				persona.persona_id,
				community.community_id,
				community.settings.defaultRoleId,
			),
		);
		unwrapError(
			await InviteToCommunityService.perform({
				...toServiceRequestMock(repos, communityPersona),
				params: {
					actor: communityPersona.persona_id,
					community_id: community.community_id,
					name: persona.name,
				},
			}),
		);
	},
);

test_communityServices(
	'LeaveCommunity removes all assignments for the persona',
	async ({repos, random}) => {
		const {community, persona} = await random.community();
		assert.ok(
			unwrap(
				await repos.assignment.isPersonaInCommunity(persona.persona_id, community.community_id),
			),
		);
		unwrap(
			await LeaveCommunityService.perform({
				...toServiceRequestMock(repos, persona),
				params: {
					actor: persona.persona_id,
					community_id: community.community_id,
					persona_id: persona.persona_id,
				},
			}),
		);
		assert.ok(
			!unwrap(
				await repos.assignment.isPersonaInCommunity(persona.persona_id, community.community_id),
			),
		);
	},
);

test_communityServices(
	'fail LeaveCommunity when the persona has no assignments',
	async ({repos, random}) => {
		const {persona} = await random.persona();
		const {community} = await random.community();

		unwrapError(
			await LeaveCommunityService.perform({
				...toServiceRequestMock(repos, persona),
				params: {
					actor: persona.persona_id,
					community_id: community.community_id,
					persona_id: persona.persona_id,
				},
			}),
		);
	},
);

test_communityServices(
	'KickFromCommunity removes all assignments for the persona',
	async ({repos, random}) => {
		const {persona} = await random.persona();
		const {community, persona: communityPersona} = await random.community();
		unwrap(
			await repos.assignment.create(
				persona.persona_id,
				community.community_id,
				community.settings.defaultRoleId,
			),
		);
		assert.ok(
			unwrap(
				await repos.assignment.isPersonaInCommunity(persona.persona_id, community.community_id),
			),
		);
		unwrap(
			await KickFromCommunityService.perform({
				...toServiceRequestMock(repos, communityPersona),
				params: {
					actor: communityPersona.persona_id,
					community_id: community.community_id,
					persona_id: persona.persona_id,
				},
			}),
		);
		assert.ok(
			!unwrap(
				await repos.assignment.isPersonaInCommunity(persona.persona_id, community.community_id),
			),
		);
	},
);

test_communityServices(
	'fail KickFromCommunity when the persona has no assignments',
	async ({repos, random}) => {
		const {persona} = await random.persona();
		const {community, persona: communityPersona} = await random.community();

		unwrapError(
			await KickFromCommunityService.perform({
				...toServiceRequestMock(repos, communityPersona),
				params: {
					actor: communityPersona.persona_id,
					community_id: community.community_id,
					persona_id: persona.persona_id,
				},
			}),
		);
	},
);

test_communityServices.run();
/* test_communityServices */
