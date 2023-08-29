import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltjs/util/result.js';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {CreateAccountActorService, DeleteActorService} from '$lib/vocab/actor/actorServices';
import {randomActionParams} from '$lib/util/randomActionParams';
import {loadAdminActor, toServiceRequestFake} from '$lib/util/testHelpers';
import {GHOST_ACTOR_ID, GHOST_ACTOR_NAME} from '$lib/util/constants';
import {CreateAssignmentService} from '$lib/vocab/assignment/assignmentServices';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

/* test__actorService */
const test__actorService = suite<TestDbContext>('actorService');

test__actorService.before(setupDb);
test__actorService.after(teardownDb);

test__actorService('create a actor & test name collisions', async ({repos, random}) => {
	const params = await randomActionParams.CreateAccountActor(random);
	params.name = params.name.toLowerCase();

	const account = await random.account();

	const toServiceRequest = () => ({
		...toServiceRequestFake(repos, undefined, undefined, account.account_id),
		params,
	});

	unwrap(await CreateAccountActorService.perform(toServiceRequest()));

	unwrapError(await CreateAccountActorService.perform(toServiceRequest()), 'fails with same name');

	params.name = params.name.toUpperCase();
	unwrapError(
		await CreateAccountActorService.perform(toServiceRequest()),
		'fails with different case',
	);

	params.name += '2';
	unwrap(
		await CreateAccountActorService.perform(toServiceRequest()),
		'succeeds with different name',
	);
});

test__actorService('ghost actor has the expected name and id', async ({repos, random}) => {
	// First create an account actor, which ensures the ghost actor has been initialized.
	unwrap(
		await CreateAccountActorService.perform({
			...toServiceRequestFake(repos, undefined, undefined, (await random.account()).account_id),
			params: await randomActionParams.CreateAccountActor(random),
		}),
	);

	const ghostActor = await repos.actor.findById(GHOST_ACTOR_ID, ACTOR_COLUMNS.all);
	assert.ok(ghostActor);
	assert.is(ghostActor.type, 'ghost');
	assert.is(ghostActor.name, GHOST_ACTOR_NAME);
	assert.is(ghostActor.actor_id, GHOST_ACTOR_ID);
});

test__actorService('delete a actor and properly clean up', async ({repos, random}) => {
	const account = await random.account();
	const {actor, personalHub, spaces} = await random.actor(account);
	const {hub, actors, spaces: hubSpaces} = await random.hub(actor, account);
	const allHubs = [personalHub, hub];
	const allSpaces = spaces.concat(hubSpaces);

	const check = async (invert: boolean) => {
		const assertIs = invert ? assert.is.not : assert.is;
		await Promise.all(
			actors.map(async (p) => {
				assertIs(await repos.actor.findById(p.actor_id, ACTOR_COLUMNS.actor_id), undefined);
				assertIs((await repos.assignment.filterByActor(p.actor_id)).length, 0);
			}),
		);
		await Promise.all(
			allHubs.map(async (c) => {
				assertIs(await repos.hub.findById(c.hub_id), undefined);
				assertIs((await repos.role.filterByHub(c.hub_id)).length, 0);
				assertIs((await repos.assignment.filterByHub(c.hub_id)).length, 0);
			}),
		);
		await Promise.all(
			allSpaces.map(async (s) => {
				assertIs(await repos.space.findById(s.space_id), undefined);
				assertIs(await repos.entity.findById(s.directory_id), undefined);
				// TODO assertIs(unwrap(await repos.entity.filterBySpace(s.space_id)).length, 0);
			}),
		);
	};

	// create a second hub and join it, and make entities that will be turned into ghosts
	const {
		hub: otherHub,
		actor: otherActor,
		spaces: [otherSpace],
	} = await random.hub();
	// TODO could be simplified with `random.assignment()`
	unwrap(
		await CreateAssignmentService.perform({
			...toServiceRequestFake(repos, otherActor),
			params: {
				actor: otherActor.actor_id,
				hub_id: otherHub.hub_id,
				actor_id: actor.actor_id,
				role_id: otherHub.settings.defaultRoleId,
			},
		}),
	);
	const otherContent = '123';
	const {entity: otherEntity} = await random.entity(
		actor,
		account,
		otherHub,
		otherSpace,
		undefined,
		{data: {content: otherContent}},
	);
	assert.is(otherEntity.data.content, otherContent);

	await check(true);

	unwrap(
		await DeleteActorService.perform({
			...toServiceRequestFake(repos, actor),
			params: {actor: actor.actor_id, actor_id: actor.actor_id},
		}),
	);

	// all of the objects should be deleted
	await check(false);

	// entity in other hub should be a ghost
	const otherEntityUpdated = await repos.entity.findById(otherEntity.entity_id);
	assert.ok(otherEntityUpdated);
	assert.is(otherEntityUpdated.data.content, otherContent);
	assert.is(otherEntityUpdated.actor_id, GHOST_ACTOR_ID);
});

test__actorService('actors cannot delete other actors', async ({repos, random}) => {
	const account = await random.account();
	const {actor: actor1} = await random.actor(account);
	const {actor: actor2} = await random.actor(account);

	unwrapError(
		await DeleteActorService.perform({
			...toServiceRequestFake(repos, actor1),
			params: {actor: actor1.actor_id, actor_id: actor2.actor_id},
		}),
	);
});

test__actorService(
	'actors can delete other actors if in the admin hub',
	async ({repos, random}) => {
		const {actor} = await random.actor();

		const adminActor = await loadAdminActor(repos);

		assert.ok(adminActor.actor_id !== actor.actor_id);

		unwrap(
			await DeleteActorService.perform({
				...toServiceRequestFake(repos, adminActor),
				params: {actor: adminActor.actor_id, actor_id: actor.actor_id},
			}),
		);
	},
);

test__actorService('actors cannot delete actors in the admin hub', async ({repos, random}) => {
	const {actor} = await random.actor();

	const adminActor = await loadAdminActor(repos);

	assert.is(
		unwrapError(
			await DeleteActorService.perform({
				...toServiceRequestFake(repos, actor),
				params: {actor: actor.actor_id, actor_id: adminActor.actor_id},
			}),
		).status,
		400,
	);
});

test__actorService.run();
/* test__actorService */
