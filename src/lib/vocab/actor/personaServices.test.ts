import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltjs/util';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {CreateAccountPersonaService, DeletePersonaService} from '$lib/vocab/actor/personaServices';
import {randomEventParams} from '$lib/util/randomEventParams';
import {loadAdminPersona, toServiceRequestMock} from '$lib/util/testHelpers';
import {GHOST_ACTOR_ID, GHOST_ACTOR_NAME} from '$lib/app/constants';
import {CreateAssignmentService} from '$lib/vocab/assignment/assignmentServices';

/* test__personaService */
const test__personaService = suite<TestDbContext>('personaService');

test__personaService.before(setupDb);
test__personaService.after(teardownDb);

test__personaService('create a persona & test name collisions', async ({repos, random}) => {
	const params = await randomEventParams.CreateAccountPersona(random);
	params.name = params.name.toLowerCase();

	const account = await random.account();

	const toServiceRequest = () => ({
		...toServiceRequestMock(repos, undefined, undefined, account.account_id),
		params,
	});

	unwrap(await CreateAccountPersonaService.perform(toServiceRequest()));

	unwrapError(
		await CreateAccountPersonaService.perform(toServiceRequest()),
		'fails with same name',
	);

	params.name = params.name.toUpperCase();
	unwrapError(
		await CreateAccountPersonaService.perform(toServiceRequest()),
		'fails with different case',
	);

	params.name += '2';
	unwrap(
		await CreateAccountPersonaService.perform(toServiceRequest()),
		'succeeds with different name',
	);
});

test__personaService('ghost persona has the expected name and id', async ({repos, random}) => {
	// First create an account persona, which ensures the ghost persona has been initialized.
	unwrap(
		await CreateAccountPersonaService.perform({
			...toServiceRequestMock(repos, undefined, undefined, (await random.account()).account_id),
			params: await randomEventParams.CreateAccountPersona(random),
		}),
	);

	const ghostPersona = unwrap(await repos.persona.findById(GHOST_ACTOR_ID));
	assert.ok(ghostPersona);
	assert.is(ghostPersona.type, 'ghost');
	assert.is(ghostPersona.name, GHOST_ACTOR_NAME);
	assert.is(ghostPersona.persona_id, GHOST_ACTOR_ID);
});

test__personaService('delete a persona and properly clean up', async ({repos, random}) => {
	const account = await random.account();
	const {persona, personalHub, spaces} = await random.persona(account);
	const {hub, personas, spaces: hubSpaces} = await random.hub(persona, account);
	const allHubs = [personalHub, hub];
	const allSpaces = spaces.concat(hubSpaces);

	const check = async (invert: boolean) => {
		const assertIs = invert ? assert.is.not : assert.is;
		await Promise.all(
			personas.map(async (p) => {
				assertIs(unwrap(await repos.persona.findById(p.persona_id)), undefined);
				assertIs(unwrap(await repos.assignment.filterByPersona(p.persona_id)).length, 0);
			}),
		);
		await Promise.all(
			allHubs.map(async (c) => {
				assertIs(unwrap(await repos.hub.findById(c.hub_id)), undefined);
				assertIs(unwrap(await repos.role.filterByHub(c.hub_id)).length, 0);
				assertIs(unwrap(await repos.assignment.filterByHub(c.hub_id)).length, 0);
			}),
		);
		await Promise.all(
			allSpaces.map(async (s) => {
				assertIs(await repos.space.findById(s.space_id), undefined);
				assertIs(unwrap(await repos.entity.findById(s.directory_id)), undefined);
				// TODO assertIs(unwrap(await repos.entity.filterBySpace(s.space_id)).length, 0);
			}),
		);
	};

	// create a second hub and join it, and make entities that will be turned into ghosts
	const {
		hub: otherHub,
		persona: otherPersona,
		spaces: [otherSpace],
	} = await random.hub();
	// TODO could be simplified with `random.assignment()`
	unwrap(
		await CreateAssignmentService.perform({
			...toServiceRequestMock(repos, otherPersona),
			params: {
				actor: otherPersona.persona_id,
				hub_id: otherHub.hub_id,
				targetActor: persona.persona_id,
				role_id: otherHub.settings.defaultRoleId,
			},
		}),
	);
	const otherContent = '123';
	const {entity: otherEntity} = await random.entity(
		persona,
		account,
		otherHub,
		otherSpace,
		undefined,
		{data: {type: 'Note', content: otherContent}},
	);
	assert.is(otherEntity.data.content, otherContent);

	await check(true);

	unwrap(
		await DeletePersonaService.perform({
			...toServiceRequestMock(repos, persona),
			params: {actor: persona.persona_id, targetActor: persona.persona_id},
		}),
	);

	// all of the objects should be deleted
	await check(false);

	// entity in other hub should be a ghost
	const otherEntityUpdated = unwrap(await repos.entity.findById(otherEntity.entity_id));
	assert.ok(otherEntityUpdated);
	assert.is(otherEntityUpdated.data.content, otherContent);
	assert.is(otherEntityUpdated.persona_id, GHOST_ACTOR_ID);
});

test__personaService('actors cannot delete other personas', async ({repos, random}) => {
	const account = await random.account();
	const {persona: persona1} = await random.persona(account);
	const {persona: persona2} = await random.persona(account);

	unwrapError(
		await DeletePersonaService.perform({
			...toServiceRequestMock(repos, persona1),
			params: {actor: persona1.persona_id, targetActor: persona2.persona_id},
		}),
	);
});

test__personaService(
	'actors can delete other personas if in the admin hub',
	async ({repos, random}) => {
		const {persona} = await random.persona();

		const actor = await loadAdminPersona(repos);

		assert.ok(actor.persona_id !== persona.persona_id);

		unwrap(
			await DeletePersonaService.perform({
				...toServiceRequestMock(repos, actor),
				params: {actor: actor.persona_id, targetActor: persona.persona_id},
			}),
		);
	},
);

test__personaService('actors cannot delete personas in the admin hub', async ({repos, random}) => {
	const {persona: actor} = await random.persona();

	const persona = await loadAdminPersona(repos);

	assert.is(
		unwrapError(
			await DeletePersonaService.perform({
				...toServiceRequestMock(repos, actor),
				params: {actor: actor.persona_id, targetActor: persona.persona_id},
			}),
		).status,
		400,
	);
});

test__personaService.run();
/* test__personaService */
