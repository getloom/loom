import {suite} from 'uvu';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import * as assert from 'uvu/assert';

/* test__ActorRepo */
const test__ActorRepo = suite<TestDbContext>('ActorRepo');

test__ActorRepo.before(setupDb);
test__ActorRepo.after(teardownDb);

test__ActorRepo(
	'filterAssociatesByAccount should include admin & ghost actors',
	async ({repos, random}) => {
		//create a persona, it should have 3 associates return including ADMIN & GHOST
		const {account, persona} = await random.persona();
		const query1 = await repos.actor.filterAssociatesByAccount(account.account_id);
		assert.equal(query1.length, 3);

		//create a hub, it should have 4 associates return
		const {hub} = await random.hub(persona, account);
		const query2 = await repos.actor.filterAssociatesByAccount(account.account_id);
		assert.equal(query2.length, 4);

		//create another persona, there should still be 4 associates returned (& not the new persona)
		const {persona: persona2} = await random.persona();
		const query3 = await repos.actor.filterAssociatesByAccount(account.account_id);
		assert.equal(query3.length, 4);

		//add new persona to hub, now 5 associates return (including new persona)
		await repos.assignment.create(persona2.actor_id, hub.hub_id, hub.settings.defaultRoleId);

		const query4 = await repos.actor.filterAssociatesByAccount(account.account_id);
		assert.equal(query4.length, 5);
	},
);

test__ActorRepo(
	'filterHubActorsById should only include distinct hub_id:actor_id pairs',
	async ({repos, random}) => {
		//create a new hub with an account; it should only return 2 hub:actor pairs (personal & new hub)
		const {account, persona, hub} = await random.hub();
		const query1 = await repos.actor.filterHubActorsByAccount(account.account_id);
		assert.equal(query1.length, 2);

		//create another persona and invite it to the hub, now there should be 3 pairs
		await random.persona(account);
		const query2 = await repos.actor.filterHubActorsByAccount(account.account_id);
		assert.equal(query2.length, 3);

		//add another role assignment for the original actor, there should still only be 3 pairs
		await repos.assignment.create(persona.actor_id, hub.hub_id, hub.settings.defaultRoleId);

		const query3 = await repos.actor.filterHubActorsByAccount(account.account_id);
		assert.equal(query3.length, 3);
	},
);

test__ActorRepo.run();
/* test__ActorRepo */
