import {unwrap} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';
import {traverse} from '@feltjs/util/object.js';
import {randomItem} from '@feltjs/util/random.js';
import {magenta} from 'kleur/colors';
import {toNext} from '@feltjs/util/array.js';

import {cyan} from '$lib/server/colors';
import type {Database} from '$lib/db/Database.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {Community} from '$lib/vocab/community/community';
import type {CreateEntityResponse, SignInParams} from '$lib/app/eventTypes';
import type {AccountPersona} from '$lib/vocab/persona/persona';
import {parseView, toCreatableViewTemplates, type ViewData} from '$lib/vocab/view/view';
import {CreateAccountPersonaService} from '$lib/vocab/persona/personaServices';
import {CreateCommunityService} from '$lib/vocab/community/communityServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {CreateAssignmentService} from '$lib/vocab/assignment/assignmentServices';
import {CreateEntityService} from '$lib/vocab/entity/entityServices';
import {toDefaultAccountSettings} from '$lib/vocab/account/accountHelpers.server';
import {CreateSpaceService} from '$lib/vocab/space/spaceServices';
import {ALPHABET} from '$lib/util/randomVocab';
import {
	defaultStandardCommunityRoles,
	type CommunityTemplate,
	type EntityTemplate,
} from '$lib/app/templates';

/* eslint-disable no-await-in-loop */

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
		const toAccountServiceRequest = () =>
			toServiceRequestMock(db, undefined, undefined, account.account_id);
		for (const personaName of personasParams[account.name]) {
			const created = unwrap(
				await CreateAccountPersonaService.perform({
					...toAccountServiceRequest(),
					params: {name: personaName},
				}),
			);
			const persona = created.personas[0] as AccountPersona;
			log.trace('created persona', persona);
			personas.push(persona);
			await createDefaultEntities(
				() => ({...toAccountServiceRequest(), actor: persona}),
				created.spaces,
				() => persona,
			);
		}
	}

	const mainPersonaCreator = personas[0] as AccountPersona;
	const toMainAccountServiceRequest = () => toServiceRequestMock(db, mainPersonaCreator);
	const otherPersonas = personas.slice(1);
	const nextPersona = toNext(personas);

	const communities: Community[] = [];

	for (const communityTemplate of communityTemplates) {
		const {community, spaces} = unwrap(
			await CreateCommunityService.perform({
				...toMainAccountServiceRequest(),
				params: {
					actor: mainPersonaCreator.persona_id,
					template: communityTemplate,
				},
			}),
		);
		communities.push(community);
		for (const persona of otherPersonas) {
			unwrap(
				await CreateAssignmentService.perform({
					...toMainAccountServiceRequest(),
					params: {
						actor: mainPersonaCreator.persona_id,
						persona_id: persona.persona_id,
						community_id: community.community_id,
						role_id: community.settings.defaultRoleId,
					},
				}),
			);
		}
		for (const space of spaces) {
			const spaceTemplate = communityTemplate.spaces?.find((s) => s.name === space.name);
			if (spaceTemplate?.entities) {
				await generateEntities(
					{toServiceRequest: toMainAccountServiceRequest, nextPersona, space},
					spaceTemplate.entities,
				);
			}
		}
		if (much) await createMuchSpaces(toMainAccountServiceRequest, community, nextPersona);
		await createDefaultEntities(toMainAccountServiceRequest, spaces, nextPersona);
	}
};

const createDefaultEntities = async (
	toServiceRequest: () => ReturnType<typeof toServiceRequestMock>,
	spaces: Space[],
	nextPersona: () => AccountPersona,
) => {
	for (const space of spaces) {
		const viewName = findFirstComponentName(parseView(space.view));
		if (!viewName) continue;
		const generateEntities = SEED_BY_VIEW_NAME[viewName];
		if (!generateEntities) {
			log.warn(`skipping entity seeding for view ${magenta(viewName)}`);
			continue;
		}
		await generateEntities({toServiceRequest, nextPersona, space});
	}
};

const generateEntity = async (
	ctx: SeedContext,
	data: EntityTemplate,
	source_id = ctx.space.directory_id,
): Promise<CreateEntityResponse> => {
	const actor = ctx.nextPersona();
	return unwrap(
		await CreateEntityService.perform({
			...ctx.toServiceRequest(),
			actor,
			params: {
				actor: actor.persona_id,
				space_id: ctx.space.space_id,
				data: typeof data === 'string' ? {type: 'Note', content: data} : data,
				ties: [{source_id}],
			},
		}),
	);
};

const generateEntities = async (
	ctx: SeedContext,
	datas: EntityTemplate[],
	source_id = ctx.space.directory_id,
): Promise<CreateEntityResponse[]> => {
	const results: CreateEntityResponse[] = [];
	for (const data of datas) {
		results.push(await generateEntity(ctx, data, source_id));
	}
	return results;
};

const communityTemplates: CommunityTemplate[] = [
	{name: 'felt'},
	{name: 'dev'},
	{
		name: 'example',
		spaces: [
			{
				name: 'list1',
				view: `<div><code>List</code> with default <code>layoutDirection="column"</code></div><List /><div><code>List</code> with <code>layoutDirection="column-reverse"</code></div><List layoutDirection="column-reverse" /><div><code>List</code> with <code>layoutDirection="row"</code></div><List layoutDirection="row" /><div><code>List</code> with <code>layoutDirection="row-reverse"</code></div><List layoutDirection="row-reverse" />`,
				icon: '?',
				entities: ['a', 'b', 'c'],
			},
			{
				name: 'list2',
				view: `<div><code>List</code> with <code>itemsDirection="column-reverse"</code></div><List itemsDirection="column-reverse" /><div><code>List</code> with <code>itemsDirection="row"</code></div><List itemsDirection="row" /><div><code>List</code> with <code>itemsDirection="row-reverse"</code></div><List itemsDirection="row-reverse" /><div><code>List</code> with <code>layoutDirection="row" itemsDirection="row-reverse"</code></div><List layoutDirection="row" itemsDirection="row-reverse" />`,
				icon: '?',
				entities: ['1', '2', '3'],
			},
		],
		roles: defaultStandardCommunityRoles,
	},
];

interface SeedContext {
	toServiceRequest: () => ReturnType<typeof toServiceRequestMock>;
	nextPersona: () => AccountPersona;
	space: Space;
}

const SEED_BY_VIEW_NAME: Record<string, (ctx: SeedContext) => Promise<void>> = {
	AdminHome: async () => {
		// TODO
	},
	Home: async () => {
		// TODO
	},
	PersonalHome: async () => {
		// TODO
	},
	InstanceAdmin: async () => {
		// TODO
	},
	Chat: async (ctx) => {
		await generateEntities(ctx, ['Those who know do not speak.', 'Those who speak do not know.']);
	},
	ReplyChat: async (ctx) => {
		const result = await generateEntity(ctx, 'Those who know do not speak.');
		await generateEntity(ctx, 'Those who speak do not know.', result.entities[0].entity_id);
	},
	Forum: async (ctx) => {
		await generateEntities(ctx, [
			{type: 'Collection', name: 'First post', content: "All the world's a stage."},
			{type: 'Collection', name: 'Second', content: 'And all the men and women merely players.'},
		]);
	},
	Board: async (ctx) => {
		await generateEntities(ctx, [
			'If the evidence says you’re wrong, you don’t have the right theory.',
			'You change the theory, not the evidence.',
		]);
	},
	Notes: async (ctx) => {
		await generateEntities(ctx, [
			'We have no guarantee about the future\nbut we exist in the hope of something better.\n- The 14th Dalai Lama',
		]);
	},
	List: async (ctx) => {
		await generateEntities(ctx, ['a', 'b', 'c']);
	},
	Lists: async (ctx) => {
		await generateEntities(ctx, ['1', '2', '3']);
	},
	Todo: async (ctx) => {
		const list = await generateEntity(ctx, {type: 'Collection', content: 'Grocery List'});
		await generateEntities(ctx, ['eggs', 'milk', 'bread'], list.entities[0].entity_id);
	},
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
	toServiceRequest: () => ReturnType<typeof toServiceRequestMock>,
	community: Community,
	nextPersona: () => AccountPersona,
) => {
	const viewTemplates = toCreatableViewTemplates(false);

	for (let i = 0; i < MUCH_SPACE_COUNT; i++) {
		const actor = nextPersona();
		const view = randomItem(viewTemplates);
		const name = view.name.toLowerCase() + i;
		unwrap(
			await CreateSpaceService.perform({
				...toServiceRequest(),
				actor,
				params: {
					actor: actor.persona_id,
					community_id: community.community_id,
					name,
					path: '/' + name,
					view: view.view,
					icon: view.icon,
				},
			}),
		);
	}
};
