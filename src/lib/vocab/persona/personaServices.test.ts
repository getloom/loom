import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltcoop/util';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {
	CreateAccountPersonaService,
	DeletePersonaService,
} from '$lib/vocab/persona/personaServices';
import {randomEventParams} from '$lib/util/randomEventParams';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {GHOST_PERSONA_ID, GHOST_PERSONA_NAME} from '$lib/app/constants';

/* test__personaService */
const test__personaService = suite<TestDbContext>('personaService');

test__personaService.before(setupDb);
test__personaService.after(teardownDb);

test__personaService('create a persona & test name collisions', async ({db, random}) => {
	const params = await randomEventParams.CreateAccountPersona(random);
	params.name = params.name.toLowerCase();

	const serviceRequest = {
		...toServiceRequestMock(db, undefined, undefined, (await random.account()).account_id),
		params,
	};

	unwrap(await CreateAccountPersonaService.perform(serviceRequest));

	unwrapError(await CreateAccountPersonaService.perform(serviceRequest), 'fails with same name');

	params.name = params.name.toUpperCase();
	unwrapError(
		await CreateAccountPersonaService.perform(serviceRequest),
		'fails with different case',
	);

	params.name += '2';
	unwrap(await CreateAccountPersonaService.perform(serviceRequest), 'succeeds with different name');
});

test__personaService('ghost persona has the expected name and id', async ({db, random}) => {
	// First create an account persona, which ensures the ghost persona has been initialized.
	const serviceRequest = {
		...toServiceRequestMock(db, undefined, undefined, (await random.account()).account_id),
		params: await randomEventParams.CreateAccountPersona(random),
	};
	unwrap(await CreateAccountPersonaService.perform(serviceRequest));

	const ghostPersona = unwrap(await db.repos.persona.findById(GHOST_PERSONA_ID));
	assert.ok(ghostPersona);
	assert.is(ghostPersona.type, 'ghost');
	assert.is(ghostPersona.name, GHOST_PERSONA_NAME);
	assert.is(ghostPersona.persona_id, GHOST_PERSONA_ID);
});

test__personaService('delete a persona and properly clean up', async ({db, random}) => {
	const account = await random.account();
	const {persona, personalCommunity, spaces} = await random.persona(account);
	const {community, personas, spaces: communitySpaces} = await random.community(persona, account);
	const {persona_id} = persona;
	const allCommunities = [personalCommunity, community];
	const allSpaces = spaces.concat(communitySpaces);

	const check = async (invert: boolean) => {
		const assertIs = invert ? assert.is.not : assert.is;
		await Promise.all(
			personas.map(async (p) => {
				assertIs(unwrap(await db.repos.persona.findById(p.persona_id)), undefined);
				assertIs(unwrap(await db.repos.assignment.filterByPersona(p.persona_id)).length, 0);
			}),
		);
		await Promise.all(
			allCommunities.map(async (c) => {
				assertIs(unwrap(await db.repos.community.findById(c.community_id)), undefined);
				assertIs(unwrap(await db.repos.role.filterByCommunity(c.community_id)).length, 0);
				assertIs(unwrap(await db.repos.assignment.filterByCommunity(c.community_id)).length, 0);
			}),
		);
		await Promise.all(
			allSpaces.map(async (s) => {
				assertIs(unwrap(await db.repos.space.findById(s.space_id)), undefined);
				assertIs(unwrap(await db.repos.entity.findById(s.directory_id)), undefined);
				// TODO assertIs(unwrap(await db.repos.entity.filterBySpace(s.space_id)).length, 0);
			}),
		);
	};

	// create a second community and join it, and make entities that will be turned into ghosts
	const otherCommunity = await random.community();
	const otherSpace = otherCommunity.spaces[0];
	const otherContent = '123';
	const {entity: otherEntity} = await random.entity(
		persona,
		account,
		otherCommunity.community,
		otherSpace,
		undefined,
		{data: {type: 'Note', content: otherContent}},
	);
	assert.is(otherEntity.data.content, otherContent);

	await check(true);

	unwrap(
		await DeletePersonaService.perform({
			...toServiceRequestMock(db, persona),
			params: {actor: persona_id, persona_id},
		}),
	);

	// all of the objects should be deleted
	await check(false);

	// entity in other community should be a ghost
	const otherEntityUpdated = unwrap(await db.repos.entity.findById(otherEntity.entity_id));
	assert.ok(otherEntityUpdated);
	assert.is(otherEntityUpdated.data.content, otherContent);
	assert.is(otherEntityUpdated.persona_id, GHOST_PERSONA_ID);
});

test__personaService.run();
/* test__personaService */
