import {unwrap} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';
import {traverse} from '@feltjs/util/object.js';
import {randomItem} from '@feltjs/util/random.js';
import {magenta} from 'kleur/colors';
import {toNext} from '@feltjs/util/array.js';

import {cyan} from '$lib/server/colors';
import type {Database} from '$lib/db/Database';
import type {Account} from '$lib/vocab/account/account';
import type {Space} from '$lib/vocab/space/space';
import type {Hub} from '$lib/vocab/hub/hub';
import type {CreateEntityResponse, SignInParams} from '$lib/vocab/action/actionTypes';
import type {AccountActor} from '$lib/vocab/actor/actor';
import {parseView, toCreatableViewTemplates, type ViewData} from '$lib/vocab/view/view';
import {CreateAccountActorService} from '$lib/vocab/actor/actorServices';
import {CreateHubService} from '$lib/vocab/hub/hubServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {CreateAssignmentService} from '$lib/vocab/assignment/assignmentServices';
import {CreateEntityService} from '$lib/vocab/entity/entityServices';
import {toDefaultAccountSettings} from '$lib/vocab/account/accountHelpers.server';
import {CreateSpaceService} from '$lib/vocab/space/spaceServices';
import {ALPHABET} from '$lib/util/randomVocab';
import {defaultCommunityHubRoles, type HubTemplate, type EntityTemplate} from '$lib/app/templates';

/* eslint-disable no-await-in-loop */

const log = new Logger([cyan('[seed]')]);

export const seed = async (db: Database, much = false): Promise<void> => {
	const {sql, repos} = db;

	log.debug('adding initial dataset to database');

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
	const actorsParams: Record<string, string[]> = {
		'a@a.a': ['alice', 'andy'],
		'b@b.b': ['betty', 'billy'],
	};
	if (much) {
		let i = 0;
		for (const actorNames of Object.values(actorsParams)) {
			actorNames.push(...ALPHABET.slice(2).map((a) => a.repeat(3) + i));
			i++;
		}
	}
	const accounts: Account[] = [];
	const actors: AccountActor[] = [];
	for (const accountParams of accountsParams) {
		const account = await repos.account.create(
			accountParams.username,
			accountParams.password,
			toDefaultAccountSettings(),
		);
		log.debug('created account', account);
		accounts.push(account);
		const toAccountServiceRequest = () =>
			toServiceRequestMock(repos, undefined, undefined, account.account_id);
		for (const actorName of actorsParams[account.name]) {
			const created = unwrap(
				await CreateAccountActorService.perform({
					...toAccountServiceRequest(),
					params: {name: actorName},
				}),
			);
			const actor = created.actors[0] as AccountActor;
			log.debug('created actor', actor);
			actors.push(actor);
			await createDefaultEntities(
				() => ({...toAccountServiceRequest(), actor}),
				created.spaces,
				() => actor,
			);
		}
	}

	const mainActorCreator = actors[0] as AccountActor;
	const toMainAccountServiceRequest = () => toServiceRequestMock(repos, mainActorCreator);
	const otherActors = actors.slice(1);
	const nextActor = toNext(actors);

	const hubs: Hub[] = [];

	for (const hubTemplate of hubTemplates) {
		const {hub, spaces} = unwrap(
			await CreateHubService.perform({
				...toMainAccountServiceRequest(),
				params: {
					actor: mainActorCreator.actor_id,
					template: hubTemplate,
				},
			}),
		);
		hubs.push(hub);
		for (const actor of otherActors) {
			unwrap(
				await CreateAssignmentService.perform({
					...toMainAccountServiceRequest(),
					params: {
						actor: mainActorCreator.actor_id,
						actor_id: actor.actor_id,
						hub_id: hub.hub_id,
						role_id: hub.settings.defaultRoleId,
					},
				}),
			);
		}
		for (const space of spaces) {
			const spaceTemplate = hubTemplate.spaces?.find((s) => s.name === space.name);
			if (spaceTemplate?.entities) {
				await generateEntities(
					{toServiceRequest: toMainAccountServiceRequest, nextActor, space},
					spaceTemplate.entities,
				);
			}
		}
		if (much) await createMuchSpaces(toMainAccountServiceRequest, hub, nextActor);
		await createDefaultEntities(toMainAccountServiceRequest, spaces, nextActor);
	}
};

const createDefaultEntities = async (
	toServiceRequest: () => ReturnType<typeof toServiceRequestMock>,
	spaces: Space[],
	nextActor: () => AccountActor,
) => {
	for (const space of spaces) {
		const viewName = findFirstComponentName(parseView(space.view));
		if (!viewName) continue;
		const generateEntities = SEED_BY_VIEW_NAME[viewName];
		if (!generateEntities) {
			log.warn(`skipping entity seeding for view ${magenta(viewName)}`);
			continue;
		}
		await generateEntities({toServiceRequest, nextActor, space});
	}
};

const generateEntity = async (
	ctx: SeedContext,
	data: EntityTemplate,
	source_id = ctx.space.directory_id,
): Promise<CreateEntityResponse> => {
	const actor = ctx.nextActor();
	return unwrap(
		await CreateEntityService.perform({
			...ctx.toServiceRequest(),
			actor,
			params: {
				actor: actor.actor_id,
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

const hubTemplates: HubTemplate[] = [
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
		roles: defaultCommunityHubRoles,
	},
];

interface SeedContext {
	toServiceRequest: () => ReturnType<typeof toServiceRequestMock>;
	nextActor: () => AccountActor;
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
		const lists = await generateEntity(ctx, {
			type: 'OrderedCollection',
			name: 'lists',
			orderedItems: [],
		});
		const list = await generateEntity(
			ctx,
			{type: 'OrderedCollection', content: 'Grocery List', orderedItems: []},
			lists.entities[0].entity_id,
		);
		await generateEntities(ctx, ['eggs', 'milk', 'bread'], list.entities[0].entity_id);
	},
	Whiteboard: async () => {
		// empty
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
	hub: Hub,
	nextActor: () => AccountActor,
) => {
	const viewTemplates = toCreatableViewTemplates(false);

	for (let i = 0; i < MUCH_SPACE_COUNT; i++) {
		const actor = nextActor();
		const view = randomItem(viewTemplates);
		const name = view.name.toLowerCase() + i;
		unwrap(
			await CreateSpaceService.perform({
				...toServiceRequest(),
				actor,
				params: {
					actor: actor.actor_id,
					hub_id: hub.hub_id,
					name,
					path: '/' + name,
					view: view.view,
					icon: view.icon,
				},
			}),
		);
	}
};
