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
} from '$lib/vocab/hub/hubServices';
import {expectApiError, invite, loadAdminActor, toServiceRequestMock} from '$lib/util/testHelpers';
import {ADMIN_HUB_ID} from '$lib/util/constants';
import {ReadRolesService} from '$lib/vocab/role/roleServices';
import {policyNames} from '$lib/vocab/policy/policyHelpers';
import {ReadPoliciesService} from '$lib/vocab/policy/policyServices';
import type {Policy} from '$lib/vocab/policy/policy';
import type {Role} from '$lib/vocab/role/role';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

const sortedPolicyNames = policyNames.slice().sort();
const toSortedPolicyNames = (policies: Policy[]) => policies.map((p) => p.name).sort();
const toSortedRoles = (roles: Role[]) => roles.slice().sort((a, b) => a.role_id - b.role_id);

/* test_hubServices */
const test_hubServices = suite<TestDbContext>('hubRepo');

test_hubServices.before(setupDb);
test_hubServices.after(teardownDb);

test_hubServices('disallow deleting personal hub', async ({repos, random}) => {
	const {actor, personalHub} = await random.actor();
	//TODO hack to allow for authorization; remove on init default impl
	await repos.policy.create(personalHub.settings.defaultRoleId, 'DeleteHub');
	assert.is(
		unwrapError(
			await DeleteHubService.perform({
				...toServiceRequestMock(repos, actor),
				params: {actor: actor.actor_id, hub_id: actor.hub_id},
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

test_hubServices('default admin hub role has all policies', async ({repos}) => {
	const adminHub = await repos.hub.loadAdminHub();
	assert.ok(adminHub);
	const adminDefaultPolicies = await repos.policy.filterByRole(adminHub.settings.defaultRoleId);

	assert.equal(toSortedPolicyNames(adminDefaultPolicies), sortedPolicyNames);
});

test_hubServices('default personal hub role has all policies', async ({repos, random}) => {
	const {actor} = await random.actor();

	const personalHub = await repos.hub.findById(actor.hub_id);
	assert.ok(personalHub);
	const personalDefaultPolicies = await repos.policy.filterByRole(
		personalHub.settings.defaultRoleId,
	);

	assert.equal(toSortedPolicyNames(personalDefaultPolicies), sortedPolicyNames);
});

test_hubServices('disallow duplicate hub names', async ({repos, random}) => {
	const {actor} = await random.actor();

	const params = randomHubParams(actor.actor_id);
	params.template.name += 'Aa';
	unwrap(await CreateHubService.perform({...toServiceRequestMock(repos, actor), params}));

	params.template.name = params.template.name.toLowerCase();
	assert.is(
		unwrapError(await CreateHubService.perform({...toServiceRequestMock(repos, actor), params}))
			.status,
		409,
	);

	params.template.name = params.template.name.toUpperCase();
	assert.is(
		unwrapError(await CreateHubService.perform({...toServiceRequestMock(repos, actor), params}))
			.status,
		409,
	);
});

test_hubServices('disallow reserved hub names', async ({repos, random}) => {
	const {actor} = await random.actor();

	const params = randomHubParams(actor.actor_id);
	params.template.name = 'docs';
	assert.is(
		unwrapError(await CreateHubService.perform({...toServiceRequestMock(repos, actor), params}))
			.status,
		409,
	);
});

test_hubServices('new hubs have default template roles & policies', async ({repos, random}) => {
	const {actor} = await random.actor();

	const params = randomHubParams(actor.actor_id);
	const hubResult = unwrap(
		await CreateHubService.perform({...toServiceRequestMock(repos, actor), params}),
	);

	const roleResult = unwrap(
		await ReadRolesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {actor: actor.actor_id, hub_id: hubResult.hub.hub_id},
		}),
	);
	assert.is(roleResult.roles.length, 2);
	assert.equal(toSortedRoles(roleResult.roles), toSortedRoles(hubResult.roles));
	assert.ok(roleResult.roles.find((r) => r.role_id === hubResult.hub.settings.defaultRoleId));

	const stewardPolicyResults = unwrap(
		await ReadPoliciesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {actor: actor.actor_id, role_id: hubResult.roles[0].role_id},
		}),
	);
	assert.equal(toSortedPolicyNames(stewardPolicyResults.policies), sortedPolicyNames);

	const memberPolicyResults = unwrap(
		await ReadPoliciesService.perform({
			...toServiceRequestMock(repos, actor),
			params: {actor: actor.actor_id, role_id: hubResult.roles[1].role_id},
		}),
	);
	assert.is(memberPolicyResults.policies.length, 5);
});

test_hubServices('deleted hubs cleanup after themselves', async ({repos, random}) => {
	const {actor} = await random.actor();
	const {hub} = await random.hub(actor);

	//TODO hack to allow for authorization; remove on init default impl
	await repos.policy.create(hub.settings.defaultRoleId, 'DeleteHub');

	unwrap(
		await DeleteHubService.perform({
			...toServiceRequestMock(repos, actor),
			params: {actor: actor.actor_id, hub_id: hub.hub_id},
		}),
	);

	//check hub actors are gone
	assert.ok(!(await repos.actor.findByHub(hub.hub_id, ACTOR_COLUMNS.actor_id)));

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
		const {actor} = await random.actor();

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
				...toServiceRequestMock(repos, actor),
				params: randomHubParams(actor.actor_id),
			}),
		);

		const adminActor = await loadAdminActor(repos);

		unwrap(
			await CreateHubService.perform({
				...toServiceRequestMock(repos, actor),
				params: randomHubParams(adminActor.actor_id),
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
	'InviteToHub assigns the default hub role to the actor',
	async ({repos, random}) => {
		const {hub, actor} = await random.hub();
		const {actor: actorToInvite} = await random.actor();
		const {assignment} = await invite(repos, actor, hub.hub_id, actorToInvite.name);
		assert.is(assignment.role_id, hub.settings.defaultRoleId);
		assert.is(assignment.actor_id, actorToInvite.actor_id);
		assert.is(assignment.hub_id, hub.hub_id);
	},
);

test_hubServices(
	'fail InviteToHub when the actor already has an assignment',
	async ({repos, random}) => {
		const {hub, actor} = await random.hub();
		const {actor: actorToInvite} = await random.actor();
		await repos.assignment.create(actorToInvite.actor_id, hub.hub_id, hub.settings.defaultRoleId);
		await expectApiError(409, invite(repos, actor, hub.hub_id, actorToInvite.name));
	},
);

test_hubServices('LeaveHub removes all assignments for the actor', async ({repos, random}) => {
	const {hub, actor} = await random.hub();
	assert.ok(await repos.assignment.isActorInHub(actor.actor_id, hub.hub_id));
	unwrap(
		await LeaveHubService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				hub_id: hub.hub_id,
				actor_id: actor.actor_id,
			},
		}),
	);
	assert.ok(!(await repos.assignment.isActorInHub(actor.actor_id, hub.hub_id)));
	assert.is(await repos.hub.findById(hub.hub_id), undefined);
});

test_hubServices('fail LeaveHub when the actor has no assignments', async ({repos, random}) => {
	const {actor} = await random.actor();
	const {hub} = await random.hub();

	await expectApiError(
		400,
		LeaveHubService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				hub_id: hub.hub_id,
				actor_id: actor.actor_id,
			},
		}),
	);
});

test_hubServices('KickFromHub removes all assignments for the actor', async ({repos, random}) => {
	const {actor} = await random.actor();
	const {hub, actor: communityActor} = await random.hub();
	await repos.assignment.create(actor.actor_id, hub.hub_id, hub.settings.defaultRoleId);
	assert.ok(await repos.assignment.isActorInHub(actor.actor_id, hub.hub_id));
	unwrap(
		await KickFromHubService.perform({
			...toServiceRequestMock(repos, communityActor),
			params: {
				actor: communityActor.actor_id,
				hub_id: hub.hub_id,
				actor_id: actor.actor_id,
			},
		}),
	);
	assert.ok(!(await repos.assignment.isActorInHub(actor.actor_id, hub.hub_id)));
});

test_hubServices('fail KickFromHub when the actor has no assignments', async ({repos, random}) => {
	const {actor} = await random.actor();
	const {hub, actor: communityActor} = await random.hub();

	await expectApiError(
		400,
		KickFromHubService.perform({
			...toServiceRequestMock(repos, communityActor),
			params: {
				actor: communityActor.actor_id,
				hub_id: hub.hub_id,
				actor_id: actor.actor_id,
			},
		}),
	);
});

test_hubServices('fail Admin LeaveHub if last actor', async ({repos}) => {
	const adminHub = await repos.hub.loadAdminHub();
	assert.ok(adminHub);
	const adminActor = await loadAdminActor(repos);

	await expectApiError(
		405,
		LeaveHubService.perform({
			...toServiceRequestMock(repos, adminActor),
			params: {
				actor: adminActor.actor_id,
				hub_id: adminHub.hub_id,
				actor_id: adminActor.actor_id,
			},
		}),
	);
});

test_hubServices('fail KickFromHub if last actor', async ({repos}) => {
	const adminHub = await repos.hub.loadAdminHub();
	assert.ok(adminHub);
	const adminActor = await loadAdminActor(repos);

	await expectApiError(
		405,
		KickFromHubService.perform({
			...toServiceRequestMock(repos, adminActor),
			params: {
				actor: adminActor.actor_id,
				hub_id: adminHub.hub_id,
				actor_id: adminActor.actor_id,
			},
		}),
	);
});

test_hubServices.run();
/* test_hubServices */
