import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltjs/util';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {
	CreateAssignmentService,
	DeleteAssignmentService,
} from '$lib/vocab/assignment/assignmentServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import type {CommunityPersona} from '$lib/vocab/persona/persona';

/* test__assignmentServices */
const test__assignmentServices = suite<TestDbContext>('assignmentServices');

test__assignmentServices.before(setupDb);
test__assignmentServices.after(teardownDb);

test__assignmentServices('disallow creating duplicate assignments', async ({repos, random}) => {
	const {hub, persona, roles} = await random.hub();
	unwrapError(
		await CreateAssignmentService.perform({
			...toServiceRequestMock(repos, persona),
			params: {
				actor: persona.persona_id,
				hub_id: hub.hub_id,
				persona_id: persona.persona_id,
				role_id: roles[0].role_id,
			},
		}),
	);
});

test__assignmentServices(
	'disallow creating assignments for personal hubs',
	async ({repos, random}) => {
		const {personalHub, persona} = await random.persona();
		unwrapError(
			await CreateAssignmentService.perform({
				...toServiceRequestMock(repos, persona),
				params: {
					actor: persona.persona_id,
					hub_id: personalHub.hub_id,
					persona_id: (await random.persona()).persona.persona_id,
					role_id: personalHub.settings.defaultRoleId,
				},
			}),
		);
	},
);

test__assignmentServices('delete an assignment in a hub', async ({repos, random}) => {
	const {hub, persona, assignments} = await random.hub();
	const assignment = assignments.find(
		(a) => a.persona_id === persona.persona_id && a.hub_id === hub.hub_id,
	)!;
	unwrap(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, persona),
			params: {
				actor: persona.persona_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.ok(!unwrap(await repos.assignment.findById(assignment.assignment_id)));
});

test__assignmentServices('fail to delete a personal assignment', async ({repos, random}) => {
	const {persona, assignment} = await random.persona();
	unwrapError(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, persona),
			params: {
				actor: persona.persona_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.ok(unwrap(await repos.assignment.findById(assignment.assignment_id)));
});

test__assignmentServices('fail to delete a hub persona assignment', async ({repos, random}) => {
	const {hub, persona, personas, assignments} = await random.hub();
	const communityPersona = personas.find((p) => p.type === 'community') as CommunityPersona;
	const assignment = assignments.find(
		(a) => a.persona_id === communityPersona.persona_id && a.hub_id === hub.hub_id,
	)!;
	unwrapError(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, communityPersona),
			params: {
				actor: persona.persona_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.ok(unwrap(await repos.assignment.findById(assignment.assignment_id)));
});

test__assignmentServices('delete orphaned hubs on last member leaving', async ({repos, random}) => {
	//Need a hub with two account members
	const {persona: persona1} = await random.persona();
	const {hub, assignments} = await random.hub(persona1);
	const assignment = assignments.find(
		(a) => a.persona_id === persona1.persona_id && a.hub_id === hub.hub_id,
	)!;
	const {persona: persona2} = await random.persona();
	const {assignment: assignment2} = unwrap(
		await CreateAssignmentService.perform({
			...toServiceRequestMock(repos, persona1),
			params: {
				actor: persona1.persona_id,
				persona_id: persona2.persona_id,
				hub_id: hub.hub_id,
				role_id: hub.settings.defaultRoleId,
			},
		}),
	);
	assert.is(unwrap(await repos.assignment.filterByHub(hub.hub_id)).length, 3);

	//Delete 1 account member, the hub still exists
	unwrap(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, persona1),
			params: {
				actor: persona1.persona_id,
				assignment_id: assignment2.assignment_id,
			},
		}),
	);
	assert.is(unwrap(await repos.assignment.filterByHub(hub.hub_id)).length, 2);
	assert.ok(unwrap(await repos.hub.findById(hub.hub_id)));

	//Delete last account member, the hub is deleted
	unwrap(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(repos, persona1),
			params: {
				actor: persona1.persona_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);

	assert.is(unwrap(await repos.assignment.filterByHub(hub.hub_id)).length, 0);
	assert.ok(!unwrap(await repos.hub.findById(hub.hub_id)));
});

test__assignmentServices.run();
/* test__assignmentServices */
