import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {
	CreateAssignmentService,
	DeleteAssignmentService,
} from '$lib/vocab/assignment/assignmentServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';

/* test__assignmentServices */
const test__assignmentServices = suite<TestDbContext & TestAppContext>('assignmentServices');

test__assignmentServices.before(setupDb);
test__assignmentServices.after(teardownDb);

test__assignmentServices('disallow creating duplicate assignments', async ({db, random}) => {
	const {community, personas} = await random.community();
	unwrapError(
		await CreateAssignmentService.perform({
			...toServiceRequestMock(db, personas[1]),
			params: {
				actor: personas[1].persona_id,
				community_id: community.community_id,
				persona_id: personas[1].persona_id,
				role_id: community.settings.defaultRoleId,
			},
		}),
	);
});

test__assignmentServices(
	'disallow creating assignments for personal communities',
	async ({db, random}) => {
		const {personalCommunity, persona} = await random.persona();
		unwrapError(
			await CreateAssignmentService.perform({
				...toServiceRequestMock(db, persona),
				params: {
					actor: persona.persona_id,
					community_id: personalCommunity.community_id,
					persona_id: (await random.persona()).persona.persona_id,
					role_id: personalCommunity.settings.defaultRoleId,
				},
			}),
		);
	},
);

test__assignmentServices('delete a assignment in a community', async ({db, random}) => {
	const {community, personas, assignments} = await random.community();
	const assignment = assignments.find(
		(a) => a.persona_id === personas[1].persona_id && a.community_id === community.community_id,
	)!;
	unwrap(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(db, personas[1]),
			params: {
				actor: personas[1].persona_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.ok(!unwrap(await db.repos.assignment.findById(assignment.assignment_id)));
});

test__assignmentServices('fail to delete a personal assignment', async ({db, random}) => {
	const {persona, assignment} = await random.persona();
	unwrapError(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(db, persona),
			params: {
				actor: persona.persona_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.ok(unwrap(await db.repos.assignment.findById(assignment.assignment_id)));
});

test__assignmentServices('fail to delete a community persona assignment', async ({db, random}) => {
	const {community, personas, assignments} = await random.community();
	const assignment = assignments.find(
		(a) => a.persona_id === personas[0].persona_id && a.community_id === community.community_id,
	)!;
	unwrapError(
		await DeleteAssignmentService.perform({
			...toServiceRequestMock(db, personas[0]),
			params: {
				actor: personas[0].persona_id,
				assignment_id: assignment.assignment_id,
			},
		}),
	);
	assert.ok(unwrap(await db.repos.assignment.findById(assignment.assignment_id)));
});

test__assignmentServices(
	'delete orphaned communities on last member leaving',
	async ({db, random}) => {
		//Need a community with two account members
		const {persona: persona1} = await random.persona();
		const {community, assignments} = await random.community(persona1);
		const assignment = assignments.find(
			(a) => a.persona_id === persona1.persona_id && a.community_id === community.community_id,
		)!;
		const {persona: persona2} = await random.persona();
		const {assignment: assignment2} = unwrap(
			await CreateAssignmentService.perform({
				...toServiceRequestMock(db, persona1),
				params: {
					actor: persona2.persona_id,
					persona_id: persona2.persona_id,
					community_id: community.community_id,
					role_id: community.settings.defaultRoleId,
				},
			}),
		);
		assert.is(
			unwrap(await db.repos.assignment.filterByCommunityId(community.community_id)).length,
			3,
		);

		//Delete 1 account member, the community still exists
		unwrap(
			await DeleteAssignmentService.perform({
				...toServiceRequestMock(db, persona2),
				params: {
					actor: persona2.persona_id,
					assignment_id: assignment2.assignment_id,
				},
			}),
		);
		assert.is(
			unwrap(await db.repos.assignment.filterByCommunityId(community.community_id)).length,
			2,
		);
		assert.ok(unwrap(await db.repos.community.findById(community.community_id)));

		//Delete last account member, the community is deleted
		unwrap(
			await DeleteAssignmentService.perform({
				...toServiceRequestMock(db, persona1),
				params: {
					actor: persona1.persona_id,
					assignment_id: assignment.assignment_id,
				},
			}),
		);

		assert.is(
			unwrap(await db.repos.assignment.filterByCommunityId(community.community_id)).length,
			0,
		);
		assert.ok(!unwrap(await db.repos.community.findById(community.community_id)));
	},
);

test__assignmentServices.run();
/* test__assignmentServices */
