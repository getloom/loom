import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltjs/util';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {
	CreateAccountPersonaService,
	DeletePersonaService,
} from '$lib/vocab/persona/personaServices';
import {randomEventParams} from '$lib/util/randomEventParams';
import {loadAdminPersona, toServiceRequestMock} from '$lib/util/testHelpers';
import {GHOST_PERSONA_ID, GHOST_PERSONA_NAME} from '$lib/app/constants';
import {CreateAssignmentService} from '$lib/vocab/assignment/assignmentServices';

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
	const {
		community: otherCommunity,
		persona: otherPersona,
		spaces: [otherSpace],
	} = await random.community();
	// TODO could be simplified with `random.assignment()`
	unwrap(
		await CreateAssignmentService.perform({
			...toServiceRequestMock(db, otherPersona),
			params: {
				actor: otherPersona.persona_id,
				community_id: otherCommunity.community_id,
				persona_id: persona.persona_id,
				role_id: otherCommunity.settings.defaultRoleId,
			},
		}),
	);
	const otherContent = '123';
	const {entity: otherEntity} = await random.entity(
		persona,
		account,
		otherCommunity,
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

test__personaService('actors cannot delete other personas', async ({db, random}) => {
	const account = await random.account();
	const {persona: persona1} = await random.persona(account);
	const {persona: persona2} = await random.persona(account);

	unwrapError(
		await DeletePersonaService.perform({
			...toServiceRequestMock(db, persona1),
			params: {actor: persona1.persona_id, persona_id: persona2.persona_id},
		}),
	);
});

test__personaService(
	'actors can delete other personas if in the admin community',
	async ({db, random}) => {
		const {persona} = await random.persona();

		const actor = await loadAdminPersona(db.repos);

		assert.ok(actor.persona_id !== persona.persona_id);

		unwrap(
			await DeletePersonaService.perform({
				...toServiceRequestMock(db, actor),
				params: {actor: actor.persona_id, persona_id: persona.persona_id},
			}),
		);
	},
);

test__personaService(
	'actors cannot delete personas in the admin community',
	async ({db, random}) => {
		const {persona: actor} = await random.persona();

		const persona = await loadAdminPersona(db.repos);

		assert.is(
			unwrapError(
				await DeletePersonaService.perform({
					...toServiceRequestMock(db, actor),
					params: {actor: actor.persona_id, persona_id: persona.persona_id},
				}),
			).status,
			400,
		);
	},
);

test__personaService.run();
/* test__personaService */
