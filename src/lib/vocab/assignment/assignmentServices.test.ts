import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {
	CreateAssignmentService,
	DeleteAssignmentService,
} from '$lib/vocab/assignment/assignmentServices';
import {expectApiError, toServiceRequestMock} from '$lib/util/testHelpers';
import type {CommunityActor} from '$lib/vocab/actor/actor';

/* test__assignmentServices */
const test__assignmentServices = suite<TestDbContext>('assignmentServices');

test__assignmentServices.before(setupDb);
test__assignmentServices.after(teardownDb);

test__assignmentServices('disallow creating duplicate assignments', async ({repos, random}) => {
	const {hub, actor, roles} = await random.hub();
	await expectApiError(
		409,
		CreateAssignmentService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				hub_id: hub.hub_id,
				actor_id: actor.actor_id,
				role_id: roles[0].role_id,
			},
		}),
	);
});

test__assignmentServices(
	'disallow creating assignments for personal hubs',
	async ({repos, random}) => {
		const {personalHub, actor} = await random.actor();
		await expectApiError(
			403,
			CreateAssignmentService.perform({
				...toServiceRequestMock(repos, actor),
				params: {
					actor: actor.actor_id,
					hub_id: personalHub.hub_id,
					actor_id: (await random.actor()).actor.actor_id,
					role_id: personalHub.settings.defaultRoleId,
				},
			}),
		);
	},
);

test__assignmentServices('delete an assignment in a hub', async ({repos, random}) => {
	const {hub, actor, assignments} = await random.hub();
	const assignment = assignments.find(
		(a) => a.actor_id === actor.actor_id && a.hub_id === hub.hub_id,
	)!;
	unwrap(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.ok(!(await repos.assignment.findById(assignment.assignment_id)));
});

test__assignmentServices('fail to delete a personal assignment', async ({repos, random}) => {
	const {actor, assignment} = await random.actor();
	unwrapError(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, actor),
			params: {
				actor: actor.actor_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.ok(await repos.assignment.findById(assignment.assignment_id));
});

test__assignmentServices('fail to delete a hub actor assignment', async ({repos, random}) => {
	const {hub, actor, actors, assignments} = await random.hub();
	const communityActor = actors.find((p) => p.type === 'community') as CommunityActor;
	const assignment = assignments.find(
		(a) => a.actor_id === communityActor.actor_id && a.hub_id === hub.hub_id,
	)!;
	unwrapError(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, communityActor),
			params: {
				actor: actor.actor_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.ok(await repos.assignment.findById(assignment.assignment_id));
});

test__assignmentServices('delete orphaned hubs on last member leaving', async ({repos, random}) => {
	//Need a hub with two account members
	const {actor: actor1} = await random.actor();
	const {hub, assignments} = await random.hub(actor1);
	const assignment = assignments.find(
		(a) => a.actor_id === actor1.actor_id && a.hub_id === hub.hub_id,
	)!;
	const {actor: actor2} = await random.actor();
	const {assignment: assignment2} = unwrap(
		await CreateAssignmentService.perform({
			...toServiceRequestMock(repos, actor1),
			params: {
				actor: actor1.actor_id,
				actor_id: actor2.actor_id,
				hub_id: hub.hub_id,
				role_id: hub.settings.defaultRoleId,
			},
		}),
	);
	assert.is((await repos.assignment.filterByHub(hub.hub_id)).length, 3);

	//Delete 1 account member, the hub still exists
	unwrap(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, actor1),
			params: {
				actor: actor1.actor_id,
				assignment_id: assignment2.assignment_id,
			},
		}),
	);
	assert.is((await repos.assignment.filterByHub(hub.hub_id)).length, 2);
	assert.ok(await repos.hub.findById(hub.hub_id));

	//Delete last account member, the hub is deleted
	unwrap(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, actor1),
			params: {
				actor: actor1.actor_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);

	assert.is((await repos.assignment.filterByHub(hub.hub_id)).length, 0);
	assert.ok(!(await repos.hub.findById(hub.hub_id)));
});

test__assignmentServices.run();
/* test__assignmentServices */
