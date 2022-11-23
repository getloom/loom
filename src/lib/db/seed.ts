import {unwrap} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';
import {traverse} from '@feltcoop/util/object.js';
import {randomItem} from '@feltcoop/util/random.js';

import {cyan} from '$lib/server/colors';
import type {Database} from '$lib/db/Database.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {Community} from '$lib/vocab/community/community';
import type {CreateCommunityParams, SignInParams} from '$lib/app/eventTypes';
import type {AccountPersona} from '$lib/vocab/persona/persona';
import {parseView, toCreatableViewTemplates, type ViewData} from '$lib/vocab/view/view';
import {CreateAccountPersonaService} from '$lib/vocab/persona/personaServices';
import {CreateCommunityService} from '$lib/vocab/community/communityServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {CreateAssignmentService} from '$lib/vocab/assignment/assignmentServices';
import {CreateEntityService} from '$lib/vocab/entity/entityServices';
import {toDefaultAccountSettings} from '$lib/vocab/account/account.schema';
import {CreateSpaceService} from '$lib/vocab/space/spaceServices';
import {ALPHABET} from '$lib/util/randomVocab';

/* eslint-disable no-await-in-loop */

// TODO extract seed helpers and db methods

const log = new Logger([cyan('[seed]')]);

export const seed = async (db: Database, much = false): Promise<void> => {
	const {sql} = db;

	log.trace('adding initial dataset to database');

	const accountDocs = await sql<Account[]>`
		SELECT account_id FROM accounts
	`;
	if (accountDocs.length) {
		return; // already seeded
	}

	// example: insert literal values
	const accountsParams: SignInParams[] = [
		{username: 'a@a.a', password: 'a'},
		{username: 'b@b.b', password: 'b'},
	];
	const personasParams: Record<string, string[]> = {
		'a@a.a': ['alice', 'andy'],
		'b@b.b': ['betty', 'billy'],
	};
	if (much) {
		let i = 0;
		for (const personaNames of Object.values(personasParams)) {
			personaNames.push(...ALPHABET.slice(2).map((a) => a.repeat(3) + i));
			i++;
		}
	}
	const accounts: Account[] = [];
	const personas: AccountPersona[] = [];
	for (const accountParams of accountsParams) {
		const account = unwrap(
			await db.repos.account.create(
				accountParams.username,
				accountParams.password,
				toDefaultAccountSettings(),
			),
		);
		log.trace('created account', account);
		accounts.push(account);
		const accountServiceRequest = toServiceRequestMock(
			db,
			undefined,
			undefined,
			account.account_id,
		);
		for (const personaName of personasParams[account.name]) {
			const created = unwrap(
				await CreateAccountPersonaService.perform({
					...accountServiceRequest,
					params: {name: personaName},
				}),
			);
			const persona = created.personas[0] as AccountPersona;
			log.trace('created persona', persona);
			personas.push(persona);
			await createDefaultEntities({...accountServiceRequest, actor: persona}, created.spaces, [
				persona,
			]);
		}
	}

	const mainPersonaCreator = personas[0] as AccountPersona;
	const mainAccountServiceRequest = toServiceRequestMock(db, mainPersonaCreator);
	const otherPersonas = personas.slice(1);

	const communitiesParams: CreateCommunityParams[] = [
		{name: 'felt', actor: mainPersonaCreator.persona_id},
		{name: 'dev', actor: mainPersonaCreator.persona_id},
		{name: 'backpackers-anonymous', actor: mainPersonaCreator.persona_id},
	];
	const communities: Community[] = [];

	for (const communityParams of communitiesParams) {
		const {community, spaces} = unwrap(
			await CreateCommunityService.perform({
				...mainAccountServiceRequest,
				params: {name: communityParams.name, actor: communityParams.actor},
			}),
		);
		communities.push(community);
		for (const persona of otherPersonas) {
			unwrap(
				await CreateAssignmentService.perform({
					...mainAccountServiceRequest,
					params: {
						actor: persona.persona_id,
						persona_id: persona.persona_id,
						community_id: community.community_id,
						role_id: community.settings.defaultRoleId,
					},
				}),
			);
		}
		if (much) await createMuchSpaces(mainAccountServiceRequest, community, personas);
		await createDefaultEntities(mainAccountServiceRequest, spaces, personas);
	}
};

const createDefaultEntities = async (
	serviceRequest: ReturnType<typeof toServiceRequestMock>,
	spaces: Space[],
	personas: AccountPersona[],
) => {
	let personaIndex = -1;
	const nextPersona = (): AccountPersona => {
		personaIndex++;
		if (personaIndex === personas.length) personaIndex = 0;
		return personas[personaIndex];
	};

	for (const space of spaces) {
		const componentName = findFirstComponentName(parseView(space.view));
		if (componentName === 'Todo') {
			await generateTodo(serviceRequest, nextPersona(), space);
		}
		if (!componentName || !(componentName in entitiesContents)) {
			continue;
		}
		const entityContents = entitiesContents[componentName];
		for (const entityContent of entityContents) {
			const actor = nextPersona();
			unwrap(
				await CreateEntityService.perform({
					...serviceRequest,
					actor,
					params: {
						actor: actor.persona_id,
						data: {type: 'Note', content: entityContent},
						ties: [{source_id: space.directory_id}],
					},
				}),
			);
		}
	}
};

const entitiesContents: Record<string, string[]> = {
	Chat: ['Those who know do not speak.', 'Those who speak do not know.'],
	Board: ["All the world's a stage.", 'And all the men and women merely players.'],
	Forum: [
		'If the evidence says you’re wrong, you don’t have the right theory.',
		'You change the theory, not the evidence.',
	],
	Notes: [
		'We have no guarantee about the future',
		'but we exist in the hope of something better.',
		'The 14th Dalai Lama',
	],
};

const generateTodo = async (
	serviceRequest: ReturnType<typeof toServiceRequestMock>,
	actor: AccountPersona,
	space: Space,
) => {
	const list = unwrap(
		await CreateEntityService.perform({
			...serviceRequest,
			actor,
			params: {
				actor: actor.persona_id,
				data: {type: 'Collection', name: 'Grocery List'},
				ties: [{source_id: space.directory_id}],
			},
		}),
	);
	const itemsContents = ['eggs', 'milk', 'bread'];
	for (const content of itemsContents) {
		unwrap(
			await CreateEntityService.perform({
				...serviceRequest,
				actor,
				params: {
					actor: actor.persona_id,
					data: {type: 'Note', content},
					ties: [{source_id: list.entity.entity_id}],
				},
			}),
		);
	}
};

const findFirstComponentName = (view: ViewData): string | undefined => {
	let result: string | undefined;
	traverse(view, (key, value, obj) => {
		if (result) return; // TODO maybe change the `traverse` API to allow stopping?
		if (key === 'type' && value === 'svelteComponent') {
			result = obj.tagName;
		}
	});
	return result;
};

const MUCH_SPACE_COUNT = 100;

const createMuchSpaces = async (
	serviceRequest: ReturnType<typeof toServiceRequestMock>,
	community: Community,
	personas: AccountPersona[],
) => {
	let personaIndex = -1;
	const nextPersona = (): AccountPersona => {
		personaIndex++;
		if (personaIndex === personas.length) personaIndex = 0;
		return personas[personaIndex];
	};

	const viewTemplates = toCreatableViewTemplates(false);

	for (let i = 0; i < MUCH_SPACE_COUNT; i++) {
		const actor = nextPersona();
		const view = randomItem(viewTemplates);
		const name = view.name.toLowerCase() + i;
		unwrap(
			await CreateSpaceService.perform({
				...serviceRequest,
				actor,
				params: {
					actor: actor.persona_id,
					community_id: community.community_id,
					name,
					url: '/' + name,
					view: view.view,
					icon: view.icon,
				},
			}),
		);
	}
};
