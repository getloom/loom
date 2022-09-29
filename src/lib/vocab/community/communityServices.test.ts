import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {randomCommunityParams} from '$lib/util/randomVocab';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {
	DeleteCommunityService,
	CreateCommunityService,
} from '$lib/vocab/community/communityServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {ADMIN_COMMUNITY_ID} from '$lib/app/admin';

/* test_communityServices */
const test_communityServices = suite<TestDbContext & TestAppContext>('communityRepo');

test_communityServices.before(setupDb);
test_communityServices.after(teardownDb);

test_communityServices('disallow deleting personal community', async ({db, random}) => {
	const {persona} = await random.persona();
	assert.is(
		unwrapError(
			await DeleteCommunityService.perform({
				...toServiceRequestMock(db, persona),
				params: {actor: persona.persona_id, community_id: persona.community_id},
			}),
		).status,
		405,
	);
});

test_communityServices('disallow deleting admin community', async ({db, random}) => {
	const {persona} = await random.persona();
	assert.is(
		unwrapError(
			await DeleteCommunityService.perform({
				...toServiceRequestMock(db, persona),
				params: {actor: persona.persona_id, community_id: ADMIN_COMMUNITY_ID},
			}),
		).status,
		405,
	);
});

test_communityServices('disallow duplicate community names', async ({db, random}) => {
	const {persona} = await random.persona();
	const serviceRequest = toServiceRequestMock(db, persona);

	const params = randomCommunityParams(persona.persona_id);
	params.name += 'Aa';
	unwrap(await CreateCommunityService.perform({...serviceRequest, params}));

	params.name = params.name.toLowerCase();
	assert.is(
		unwrapError(await CreateCommunityService.perform({...serviceRequest, params})).status,
		409,
	);

	params.name = params.name.toUpperCase();
	assert.is(
		unwrapError(await CreateCommunityService.perform({...serviceRequest, params})).status,
		409,
	);
});

test_communityServices('disallow reserved community names', async ({db, random}) => {
	const {persona} = await random.persona();
	const serviceRequest = toServiceRequestMock(db, persona);

	const params = randomCommunityParams(persona.persona_id);
	params.name = 'docs';
	assert.is(
		unwrapError(await CreateCommunityService.perform({...serviceRequest, params})).status,
		409,
	);
});

test_communityServices.run();
/* test_communityServices */
