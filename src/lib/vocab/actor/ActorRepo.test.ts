import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

/* test__ActorRepo */
const test__ActorRepo = suite<TestDbContext>('ActorRepo');

test__ActorRepo.before(setupDb);
test__ActorRepo.after(teardownDb);

test__ActorRepo(
	'filterAssociatesByAccount should include admin & ghost actors',
	async ({repos, random}) => {
		//create a actor, it should have 3 associates return including ADMIN & GHOST
		const {account, actor} = await random.actor();
		const query1 = await repos.actor.filterAssociatesByAccount(
			account.account_id,
			ACTOR_COLUMNS.actor_id,
		);
		assert.equal(query1.length, 3);

		//create a hub, it should have 4 associates return
		const {hub} = await random.hub(actor, account);
		const query2 = await repos.actor.filterAssociatesByAccount(
			account.account_id,
			ACTOR_COLUMNS.actor_id,
		);
		assert.equal(query2.length, 4);

		//create another actor, there should still be 4 associates returned (& not the new actor)
		const {actor: actor2} = await random.actor();
		const query3 = await repos.actor.filterAssociatesByAccount(
			account.account_id,
			ACTOR_COLUMNS.actor_id,
		);
		assert.equal(query3.length, 4);

		//add new actor to hub, now 5 associates return (including new actor)
		await repos.assignment.create(actor2.actor_id, hub.hub_id, hub.settings.defaultRoleId);

		const query4 = await repos.actor.filterAssociatesByAccount(
			account.account_id,
			ACTOR_COLUMNS.actor_id,
		);
		assert.equal(query4.length, 5);
	},
);

test__ActorRepo(
	'filterHubActorsById should only include distinct hub_id:actor_id pairs',
	async ({repos, random}) => {
		//create a new hub with an account; it should only return 2 hub:actor pairs (personal & new hub)
		const {account, actor, hub} = await random.hub();
		const query1 = await repos.actor.filterHubActorsByAccount(account.account_id);
		assert.equal(query1.length, 2);

		//create another actor and invite it to the hub, now there should be 3 pairs
		await random.actor(account);
		const query2 = await repos.actor.filterHubActorsByAccount(account.account_id);
		assert.equal(query2.length, 3);

		//add another role assignment for the original actor, there should still only be 3 pairs
		await repos.assignment.create(actor.actor_id, hub.hub_id, hub.settings.defaultRoleId);

		const query3 = await repos.actor.filterHubActorsByAccount(account.account_id);
		assert.equal(query3.length, 3);
	},
);

test__ActorRepo.run();
/* test__ActorRepo */
