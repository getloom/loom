import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {randomHubParams} from '$lib/util/randomVocab';
import {
	DeleteHubService,
	CreateHubService,
	KickFromHubService,
	LeaveHubService,
	InviteToHubService,
} from '$lib/vocab/hub/hubServices';
import {expectApiError, loadAdminActor, toServiceRequestMock} from '$lib/util/testHelpers';
import {ADMIN_HUB_ID} from '$lib/app/constants';
import {ReadRolesService} from '$lib/vocab/role/roleServices';
import {permissionNames, permissions} from '$lib/vocab/policy/permissions';
import {ReadPoliciesService} from '$lib/vocab/policy/policyServices';
import type {Policy} from '$lib/vocab/policy/policy';
import type {Role} from '$lib/vocab/role/role';

const sortedPermissionNames = permissionNames.slice().sort();
const toSortedPermissionNames = (policies: Policy[]) => policies.map((p) => p.permission).sort();
const toSortedRoles = (roles: Role[]) => roles.slice().sort((a, b) => a.role_id - b.role_id);

/* test_hubServices */
const test_hubServices = suite<TestDbContext>('hubRepo');

test_hubServices.before(setupDb);
test_hubServices.after(teardownDb);

test_hubServices('disallow deleting personal hub', async ({repos, random}) => {
	const {persona, personalHub} = await random.persona();
	//TODO hack to allow for authorization; remove on init default impl
	await repos.policy.create(personalHub.settings.defaultRoleId, permissions.DeleteHub);
	assert.is(
		unwrapError(
			await DeleteHubService.perform({
				...toServiceRequestMock(repos, persona),
				params: {actor: persona.actor_id, hub_id: persona.hub_id},
			}),
		).status,
		405,
	);
});

test_hubServices('disallow deleting admin hub', async ({repos}) => {
	const adminActor = await loadAdminActor(repos);
	assert.is(
		unwrapError(
			await DeleteHubService.perform({
				...toServiceRequestMock(repos, adminActor),
				params: {actor: adminActor.actor_id, hub_id: ADMIN_HUB_ID},
			}),
		).status,
		405,
	);
});

test_hubServices('default admin hub role has all permissions', async ({repos}) => {
	const adminHub = await repos.hub.loadAdminHub();
	assert.ok(adminHub);
	const adminDefaultPolicies = await repos.policy.filterByRole(adminHub.settings.defaultRoleId);

	assert.equal(toSortedPermissionNames(adminDefaultPolicies), sortedPermissionNames);
});

test_hubServices('default personal hub role has all permissions', async ({repos, random}) => {
	const {persona} = await random.persona();

	const personalHub = await repos.hub.findById(persona.hub_id);
	assert.ok(personalHub);
	const personalDefaultPolicies = await repos.policy.filterByRole(
		personalHub.settings.defaultRoleId,
	);

	assert.equal(toSortedPermissionNames(personalDefaultPolicies), sortedPermissionNames);
});

test_hubServices('disallow duplicate hub names', async ({repos, random}) => {
	const {persona} = await random.persona();

	const params = randomHubParams(persona.actor_id);
	params.template.name += 'Aa';
	unwrap(await CreateHubService.perform({...toServiceRequestMock(repos, persona), params}));

	params.template.name = params.template.name.toLowerCase();
	assert.is(
		unwrapError(await CreateHubService.perform({...toServiceRequestMock(repos, persona), params}))
			.status,
		409,
	);

	params.template.name = params.template.name.toUpperCase();
	assert.is(
		unwrapError(await CreateHubService.perform({...toServiceRequestMock(repos, persona), params}))
			.status,
		409,
	);
});

test_hubServices('disallow reserved hub names', async ({repos, random}) => {
	const {persona} = await random.persona();

	const params = randomHubParams(persona.actor_id);
	params.template.name = 'docs';
	assert.is(
		unwrapError(await CreateHubService.perform({...toServiceRequestMock(repos, persona), params}))
			.status,
		409,
	);
});

test_hubServices('new hubs have default template roles & policies', async ({repos, random}) => {
	const {persona} = await random.persona();

	const params = randomHubParams(persona.actor_id);
	const hubResult = unwrap(
		await CreateHubService.perform({...toServiceRequestMock(repos, persona), params}),
	);

	const roleResult = unwrap(
		await ReadRolesService.perform({
			...toServiceRequestMock(repos, persona),
			params: {actor: persona.actor_id, hub_id: hubResult.hub.hub_id},
		}),
	);
	assert.is(roleResult.roles.length, 2);
	assert.equal(toSortedRoles(roleResult.roles), toSortedRoles(hubResult.roles));
	assert.ok(roleResult.roles.find((r) => r.role_id === hubResult.hub.settings.defaultRoleId));

	const stewardPolicyResults = unwrap(
		await ReadPoliciesService.perform({
			...toServiceRequestMock(repos, persona),
			params: {actor: persona.actor_id, role_id: hubResult.roles[0].role_id},
		}),
	);
	assert.equal(toSortedPermissionNames(stewardPolicyResults.policies), sortedPermissionNames);

	const memberPolicyResults = unwrap(
		await ReadPoliciesService.perform({
			...toServiceRequestMock(repos, persona),
			params: {actor: persona.actor_id, role_id: hubResult.roles[1].role_id},
		}),
	);
	assert.is(memberPolicyResults.policies.length, 5);
});

test_hubServices('deleted hubs cleanup after themselves', async ({repos, random}) => {
	const {persona} = await random.persona();
	const {hub} = await random.hub(persona);

	//TODO hack to allow for authorization; remove on init default impl
	await repos.policy.create(hub.settings.defaultRoleId, permissions.DeleteHub);

	unwrap(
		await DeleteHubService.perform({
			...toServiceRequestMock(repos, persona),
			params: {actor: persona.actor_id, hub_id: hub.hub_id},
		}),
	);

	//check hub actors are gone
	assert.ok(!(await repos.actor.findByHub(hub.hub_id)));

	//check hub spaces are gone
	const spaceResult = await repos.space.filterByHub(hub.hub_id);
	assert.is(spaceResult.length, 0);

	//check hub assignments are gone
	const assignmentResult = await repos.assignment.filterByHub(hub.hub_id);
	assert.is(assignmentResult.length, 0);

	//check roles are gone
	const roleResult = await repos.role.filterByHub(hub.hub_id);
	assert.is(roleResult.length, 0);

	//check hub is gone
	assert.ok(!(await repos.hub.findById(hub.hub_id)));
});

test_hubServices(
	'when new hubs are disabled, only admins should be able to create new ones',
	async ({repos, random}) => {
		const {persona} = await random.persona();

		const adminHub = await repos.hub.loadAdminHub();
		assert.ok(adminHub);
		const {settings} = adminHub;
		const settingValue = settings.instance?.disableCreateHub;
		await repos.hub.updateSettings(ADMIN_HUB_ID, {
			...settings,
			instance: {...settings.instance, disableCreateHub: true},
		});

		unwrapError(
			await CreateHubService.perform({
				...toServiceRequestMock(repos, persona),
				params: randomHubParams(persona.actor_id),
			}),
		);

		const actor = await loadAdminActor(repos);

		unwrap(
			await CreateHubService.perform({
				...toServiceRequestMock(repos, persona),
				params: randomHubParams(actor.actor_id),
			}),
		);

		//cleanup from test; do not delete
		await repos.hub.updateSettings(ADMIN_HUB_ID, {
			...settings,
			instance: {...settings.instance, disableCreateHub: settingValue},
		});
	},
);

test_hubServices(
	'InviteToHub assigns the default hub role to the persona',
	async ({repos, random}) => {
		const {persona} = await random.persona();
		const {hub, persona: communityActor} = await random.hub();
		unwrap(
			await InviteToHubService.perform({
				...toServiceRequestMock(repos, communityActor),
				params: {
					actor: communityActor.actor_id,
					hub_id: hub.hub_id,
					name: persona.name,
				},
			}),
		);
	},
);

test_hubServices(
	'fail InviteToHub when the persona already has an assignment',
	async ({repos, random}) => {
		const {persona} = await random.persona();
		const {hub, persona: communityActor} = await random.hub();
		await repos.assignment.create(persona.actor_id, hub.hub_id, hub.settings.defaultRoleId);
		unwrapError(
			await InviteToHubService.perform({
				...toServiceRequestMock(repos, communityActor),
				params: {
					actor: communityActor.actor_id,
					hub_id: hub.hub_id,
					name: persona.name,
				},
			}),
		);
	},
);

test_hubServices('LeaveHub removes all assignments for the persona', async ({repos, random}) => {
	const {hub, persona} = await random.hub();
	assert.ok(await repos.assignment.isActorInHub(persona.actor_id, hub.hub_id));
	unwrap(
		await LeaveHubService.perform({
			...toServiceRequestMock(repos, persona),
			params: {
				actor: persona.actor_id,
				hub_id: hub.hub_id,
				actor_id: persona.actor_id,
			},
		}),
	);
	assert.ok(!(await repos.assignment.isActorInHub(persona.actor_id, hub.hub_id)));
	assert.is(await repos.hub.findById(hub.hub_id), undefined);
});

test_hubServices('fail LeaveHub when the persona has no assignments', async ({repos, random}) => {
	const {persona} = await random.persona();
	const {hub} = await random.hub();

	await expectApiError(400, () =>
		LeaveHubService.perform({
			...toServiceRequestMock(repos, persona),
			params: {
				actor: persona.actor_id,
				hub_id: hub.hub_id,
				actor_id: persona.actor_id,
			},
		}),
	);
});

test_hubServices('KickFromHub removes all assignments for the persona', async ({repos, random}) => {
	const {persona} = await random.persona();
	const {hub, persona: communityActor} = await random.hub();
	await repos.assignment.create(persona.actor_id, hub.hub_id, hub.settings.defaultRoleId);
	assert.ok(await repos.assignment.isActorInHub(persona.actor_id, hub.hub_id));
	unwrap(
		await KickFromHubService.perform({
			...toServiceRequestMock(repos, communityActor),
			params: {
				actor: communityActor.actor_id,
				hub_id: hub.hub_id,
				actor_id: persona.actor_id,
			},
		}),
	);
	assert.ok(!(await repos.assignment.isActorInHub(persona.actor_id, hub.hub_id)));
});

test_hubServices(
	'fail KickFromHub when the persona has no assignments',
	async ({repos, random}) => {
		const {persona} = await random.persona();
		const {hub, persona: communityActor} = await random.hub();

		await expectApiError(400, () =>
			KickFromHubService.perform({
				...toServiceRequestMock(repos, communityActor),
				params: {
					actor: communityActor.actor_id,
					hub_id: hub.hub_id,
					actor_id: persona.actor_id,
				},
			}),
		);
	},
);

test_hubServices.run();
/* test_hubServices */
