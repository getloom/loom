import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltcoop/util';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {CreateAccountPersonaService} from '$lib/vocab/persona/personaServices';
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

test__personaService.run();
/* test__personaService */
