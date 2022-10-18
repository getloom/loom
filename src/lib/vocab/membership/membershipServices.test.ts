import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {
	CreateMembershipService,
	DeleteMembershipService,
} from '$lib/vocab/membership/membershipServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';

/* test__membershipServices */
const test__membershipServices = suite<TestDbContext & TestAppContext>('membershipServices');

test__membershipServices.before(setupDb);
test__membershipServices.after(teardownDb);

test__membershipServices('disallow creating duplicate memberships', async ({db, random}) => {
	const {community, personas} = await random.community();
	unwrapError(
		await CreateMembershipService.perform({
			...toServiceRequestMock(db, personas[1]),
			params: {
				actor: personas[1].persona_id,
				community_id: community.community_id,
				persona_id: personas[1].persona_id,
			},
		}),
	);
});

test__membershipServices(
	'disallow creating memberships for personal communities',
	async ({db, random}) => {
		const {personalCommunity, persona} = await random.persona();
		unwrapError(
			await CreateMembershipService.perform({
				...toServiceRequestMock(db, persona),
				params: {
					actor: persona.persona_id,
					community_id: personalCommunity.community_id,
					persona_id: (await random.persona()).persona.persona_id,
				},
			}),
		);
	},
);

test__membershipServices('delete a membership in a community', async ({db, random}) => {
	const {community, personas} = await random.community();
	unwrap(
		await DeleteMembershipService.perform({
			...toServiceRequestMock(db, personas[1]),
			params: {
				actor: personas[1].persona_id,
				persona_id: personas[1].persona_id,
				community_id: community.community_id,
			},
		}),
	);
	assert.ok(
		!unwrap(await db.repos.membership.findById(personas[1].persona_id, community.community_id)),
	);
});

test__membershipServices('fail to delete a personal membership', async ({db, random}) => {
	const {persona} = await random.persona();
	unwrapError(
		await DeleteMembershipService.perform({
			...toServiceRequestMock(db, persona),
			params: {
				actor: persona.persona_id,
				persona_id: persona.persona_id,
				community_id: persona.community_id,
			},
		}),
	);
	assert.ok(unwrap(await db.repos.membership.findById(persona.persona_id, persona.community_id)));
});

test__membershipServices('fail to delete a community persona membership', async ({db, random}) => {
	const {community, personas} = await random.community();
	unwrapError(
		await DeleteMembershipService.perform({
			...toServiceRequestMock(db, personas[0]),
			params: {
				actor: personas[0].persona_id,
				persona_id: personas[0].persona_id,
				community_id: community.community_id,
			},
		}),
	);
	assert.ok(
		unwrap(await db.repos.membership.findById(personas[0].persona_id, community.community_id)),
	);
});

test__membershipServices(
	'delete orphaned communities on last member leaving',
	async ({db, random}) => {
		//Need a community with two account members
		const {persona: persona1} = await random.persona();
		const {community} = await random.community(persona1);
		const {persona: persona2} = await random.persona();
		unwrap(
			await CreateMembershipService.perform({
				...toServiceRequestMock(db, persona1),
				params: {
					actor: persona2.persona_id,
					persona_id: persona2.persona_id,
					community_id: community.community_id,
				},
			}),
		);
		assert.is(
			unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
			3,
		);

		//Delete 1 account member, the community still exists
		unwrap(
			await DeleteMembershipService.perform({
				...toServiceRequestMock(db, persona2),
				params: {
					actor: persona2.persona_id,
					persona_id: persona2.persona_id,
					community_id: community.community_id,
				},
			}),
		);
		assert.is(
			unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
			2,
		);
		assert.ok(unwrap(await db.repos.community.findById(community.community_id)));

		//Delete last account member, the community is deleted
		unwrap(
			await DeleteMembershipService.perform({
				...toServiceRequestMock(db, persona1),
				params: {
					actor: persona1.persona_id,
					persona_id: persona1.persona_id,
					community_id: community.community_id,
				},
			}),
		);

		assert.is(
			unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
			0,
		);
		assert.ok(!unwrap(await db.repos.community.findById(community.community_id)));
	},
);

test__membershipServices.run();
/* test__membershipServices */
