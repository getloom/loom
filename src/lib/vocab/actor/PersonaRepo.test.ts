import {suite} from 'uvu';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import * as assert from 'uvu/assert';

/* test__PersonaRepo */
const test__PersonaRepo = suite<TestDbContext>('PersonaRepo');

test__PersonaRepo.before(setupDb);
test__PersonaRepo.after(teardownDb);

test__PersonaRepo(
	'filterAssociatesByAccount should include admin & ghost personas',
	async ({repos, random}) => {
		//create a persona, it should have 3 associates return including ADMIN & GHOST
		const {account, persona} = await random.persona();
		const query1 = await repos.persona.filterAssociatesByAccount(account.account_id);
		assert.equal(query1.length, 3);

		//create a hub, it should have 4 associates return
		const {hub} = await random.hub(persona, account);
		const query2 = await repos.persona.filterAssociatesByAccount(account.account_id);
		assert.equal(query2.length, 4);

		//create another persona, there should still be 4 associates returned (& not the new persona)
		const {persona: persona2} = await random.persona();
		const query3 = await repos.persona.filterAssociatesByAccount(account.account_id);
		assert.equal(query3.length, 4);

		//add new persona to hub, now 5 associates return (including new persona)
		await repos.assignment.create(persona2.persona_id, hub.hub_id, hub.settings.defaultRoleId);

		const query4 = await repos.persona.filterAssociatesByAccount(account.account_id);
		assert.equal(query4.length, 5);
	},
);

test__PersonaRepo.run();
/* test__PersonaRepo */
