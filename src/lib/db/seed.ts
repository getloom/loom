import {unwrap} from '@ryanatkn/belt/result.js';
import {Logger} from '@ryanatkn/belt/log.js';
import {traverse} from '@ryanatkn/belt/object.js';
import {random_item} from '@ryanatkn/belt/random.js';
import {magenta} from 'kleur/colors';
import {to_next} from '@ryanatkn/belt/array.js';
import type {Omit_Strict} from '@ryanatkn/belt/types.js';

import {cyan} from '$lib/server/colors.js';
import type {Database} from '$lib/db/Database.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {Hub} from '$lib/vocab/hub/hub.js';
import type {
	CreateEntityParams,
	CreateEntityResponse,
	SignInParams,
} from '$lib/vocab/action/actionTypes.js';
import type {AccountActor} from '$lib/vocab/actor/actor.js';
import {parseView, toCreatableViewTemplates, type ViewData} from '$lib/vocab/view/view.js';
import {CreateAccountActorService} from '$lib/vocab/actor/actorServices.js';
import {CreateHubService, UpdateHubService} from '$lib/vocab/hub/hubServices.js';
import {toServiceRequestFake} from '$lib/util/testHelpers.js';
import {CreateAssignmentService} from '$lib/vocab/assignment/assignmentServices.js';
import {CreateEntityService} from '$lib/vocab/entity/entityServices.js';
import {
	ACCOUNT_COLUMNS,
	toDefaultAccountSettings,
} from '$lib/vocab/account/accountHelpers.server.js';
import {CreateSpaceService} from '$lib/vocab/space/spaceServices.js';
import {ALPHABET} from '$lib/util/randomVocab.js';
import {
	defaultCommunityHubRoles,
	type HubTemplate,
	type EntityTemplate,
} from '$lib/ui/templates.js';
import type {Directory} from '$lib/vocab/entity/entityData.js';
import type {Repos} from '$lib/db/Repos.js';
import {create_password_hasher} from '$lib/server/password_hasher.js';
import {ADMIN_HUB_ID} from '$lib/util/constants.js';
import type {AuthorizedServiceRequest} from '$lib/server/service.js';

/* eslint-disable no-await-in-loop */

const log = new Logger([cyan('[seed]')]);

export const seed = async (db: Database, much = false): Promise<void> => {
	const {sql, repos} = db;

	// resource setup
	const passwordHasher = create_password_hasher();

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
			passwordHasher,
			accountParams.username,
			accountParams.password,
			toDefaultAccountSettings(),
			ACCOUNT_COLUMNS.all,
		);
		log.debug('created account', account);
		accounts.push(account);
		for (const actorName of actorsParams[account.name]) {
			const created = unwrap(
				await CreateAccountActorService.perform({
					...toServiceRequestFake(repos, undefined, account.account_id),
					params: {name: actorName},
				}),
			);
			const actor = created.actors[0] as AccountActor;
			log.debug('created actor', actor);
			actors.push(actor);
			await createDefaultEntities(
				repos,
				() => toServiceRequestFake(repos, actor, account.account_id),
				created.spaces,
				() => actor,
			);
		}
	}

	const mainActorCreator = actors[0];
	const toMainAccountServiceRequest = () => toServiceRequestFake(repos, mainActorCreator);
	const otherActors = actors.slice(1);
	const nextActor = to_next(actors);

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
				const directory = (await repos.entity.findById(space.directory_id)) as Directory;
				await generateEntities(
					{toServiceRequest: toMainAccountServiceRequest, nextActor, space, directory},
					spaceTemplate.entities,
				);
			}
		}
		if (much) await createMuchSpaces(toMainAccountServiceRequest, hub, nextActor);
		await createDefaultEntities(repos, toMainAccountServiceRequest, spaces, nextActor);
	}

	const adminHub = await repos.hub.loadAdminHub();
	if (!adminHub) {
		throw Error('no admin hub created while seeding db');
	}
	await UpdateHubService.perform({
		...toMainAccountServiceRequest(),
		params: {
			actor: mainActorCreator.actor_id,
			hub_id: ADMIN_HUB_ID,
			settings: {
				...adminHub.settings,
				instance: {...adminHub.settings.instance, minPasswordLength: 1},
			},
		},
	});
	// resource teardown
	await passwordHasher.close();
};

const createDefaultEntities = async (
	repos: Repos,
	toServiceRequest: () => Omit_Strict<AuthorizedServiceRequest, 'params'>,
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
		const directory = (await repos.entity.findById(space.directory_id)) as Directory;
		await generateEntities({toServiceRequest, nextActor, space, directory});
	}
};

const generateEntity = async (
	ctx: SeedContext,
	data: EntityTemplate,
	source_id = ctx.space.directory_id,
	path?: string,
	otherTies?: CreateEntityParams['ties'],
): Promise<CreateEntityResponse> => {
	const actor = ctx.nextActor();
	const t: CreateEntityParams['ties'] = [{source_id}];
	return unwrap(
		await CreateEntityService.perform({
			...ctx.toServiceRequest(),
			actor,
			params: {
				actor: actor.actor_id,
				space_id: ctx.space.space_id,
				path,
				data: typeof data === 'string' ? {content: data} : data,
				ties: otherTies ? otherTies.concat(t) : t,
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
	toServiceRequest: () => Omit_Strict<AuthorizedServiceRequest, 'params'>;
	nextActor: () => AccountActor;
	space: Space;
	directory: Directory;
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
		const e1 = await generateEntity(ctx, 'Those who know do not speak.');
		await generateEntity(ctx, 'Those who speak do not know.', undefined, undefined, [
			{source_id: e1.entities[0].entity_id, type: 'HasReply'},
		]);
	},
	Forum: async (ctx) => {
		await generateEntities(ctx, [
			{type: 'Collection', name: 'First post', content: "All the world's a stage."},
			{type: 'Collection', name: 'Second', content: 'And all the men and women merely players.'},
		]);
	},
	Board: async (ctx) => {
		const r = await generateEntities(ctx, ['a board item', 'board item b']);
		const r2 = await generateEntities(ctx, ['a reply 1', 'a reply 2'], r[0].entities[0].entity_id);
		await generateEntities(ctx, ['reply b 1', 'reply b 2'], r[1].entities[0].entity_id);
		await generateEntities(ctx, ['a'], r2[1].entities[0].entity_id);
	},
	Notes: async (ctx) => {
		const notes = await generateEntity(
			ctx,
			{type: 'OrderedCollection', orderedItems: []},
			undefined,
			'/notes',
		);
		await generateEntities(
			ctx,
			[
				'We have no guarantee about the future\nbut we exist in the hope of something better.\n- The 14th Dalai Lama',
			],
			notes.entities[0].entity_id,
		);
	},
	List: async (ctx) => {
		const list = await generateEntity(
			ctx,
			{type: 'OrderedCollection', orderedItems: []},
			undefined,
			'/list',
		);
		await generateEntities(ctx, ['a', 'b', 'c'], list.entities[0].entity_id);
	},
	Lists: async (ctx) => {
		const lists = await generateEntity(
			ctx,
			{type: 'OrderedCollection', orderedItems: []},
			undefined,
			'/lists',
		);
		await generateEntities(
			ctx,
			[
				{type: 'OrderedCollection', content: '1', orderedItems: []},
				{type: 'OrderedCollection', content: '2', orderedItems: []},
				{type: 'OrderedCollection', content: '3', orderedItems: []},
			],
			lists.entities[0].entity_id,
		);
	},
	Todo: async (ctx) => {
		const lists = await generateEntity(
			ctx,
			{type: 'OrderedCollection', orderedItems: []},
			undefined,
			'/lists',
		);
		const list = await generateEntity(
			ctx,
			{type: 'OrderedCollection', content: 'Grocery List', orderedItems: []},
			lists.entities[0].entity_id,
		);
		await generateEntities(ctx, ['eggs', 'milk', 'bread'], list.entities[0].entity_id);
	},
	Mural: async () => {
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
	toServiceRequest: () => Omit_Strict<AuthorizedServiceRequest<any>, 'params'>,
	hub: Hub,
	nextActor: () => AccountActor,
) => {
	const viewTemplates = toCreatableViewTemplates(false);

	for (let i = 0; i < MUCH_SPACE_COUNT; i++) {
		const actor = nextActor();
		const view = random_item(viewTemplates);
		const name = view.name.toLowerCase() + i;
		unwrap(
			await CreateSpaceService.perform({
				...toServiceRequest(),
				actor,
				params: {
					actor: actor.actor_id,
					hub_id: hub.hub_id,
					name,
					view: view.view,
					icon: view.icon,
				},
			}),
		);
	}
};
