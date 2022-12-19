import {unwrap} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';
import {traverse} from '@feltcoop/util/object.js';
import {randomItem} from '@feltcoop/util/random.js';
import {magenta} from 'kleur/colors';
import {toNext} from '@feltcoop/util/array.js';

import {cyan} from '$lib/server/colors';
import type {Database} from '$lib/db/Database.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {Community} from '$lib/vocab/community/community';
import type {CreateCommunityParams, CreateEntityResponse, SignInParams} from '$lib/app/eventTypes';
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
import type {EntityData} from '$lib/vocab/entity/entityData';
import {
	policyTemplateToCreatePolicyParams,
	roleTemplateToCreateRoleParams,
	spaceTemplateToCreateSpaceParams,
	type CommunityTemplate,
	type EntityTemplate,
} from '$lib/app/templates';
import {CreateRoleService} from '$lib/vocab/role/roleServices';
import {CreatePolicyService} from '$lib/vocab/policy/policyServices';

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
			await createDefaultEntities(
				{...accountServiceRequest, actor: persona},
				created.spaces,
				() => persona,
			);
		}
	}

	const mainPersonaCreator = personas[0] as AccountPersona;
	const mainAccountServiceRequest = toServiceRequestMock(db, mainPersonaCreator);
	const otherPersonas = personas.slice(1);
	const nextPersona = toNext(personas);

	const communities: Community[] = [];

	for (const communityTemplate of communityTemplates) {
		const communityParams: CreateCommunityParams = {
			name: communityTemplate.name,
			actor: mainPersonaCreator.persona_id,
		};
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
		if (communityTemplate.spaces) {
			for (const spaceTemplate of communityTemplate.spaces) {
				const {space} = unwrap(
					await CreateSpaceService.perform({
						...mainAccountServiceRequest,
						params: spaceTemplateToCreateSpaceParams(
							spaceTemplate,
							mainPersonaCreator.persona_id,
							community.community_id,
						),
					}),
				);
				if (spaceTemplate.entities) {
					await generateEntities(
						{serviceRequest: mainAccountServiceRequest, nextPersona, space},
						spaceTemplate.entities,
					);
				}
			}
		}
		const roleIdByName: Record<string, number> = {};
		if (communityTemplate.roles) {
			for (const roleTemplate of communityTemplate.roles) {
				const {role} = unwrap(
					await CreateRoleService.perform({
						...mainAccountServiceRequest,
						params: roleTemplateToCreateRoleParams(
							roleTemplate,
							mainPersonaCreator.persona_id,
							community.community_id,
						),
					}),
				);
				roleIdByName[role.name] = role.role_id;
				if (roleTemplate.policies) {
					for (const policyTemplate of roleTemplate.policies) {
						unwrap(
							await CreatePolicyService.perform({
								...mainAccountServiceRequest,
								params: policyTemplateToCreatePolicyParams(
									policyTemplate,
									mainPersonaCreator.persona_id,
									roleIdByName[roleTemplate.name],
								),
							}),
						);
					}
				}
			}
		}
		if (much) await createMuchSpaces(mainAccountServiceRequest, community, nextPersona);
		await createDefaultEntities(mainAccountServiceRequest, spaces, nextPersona);
	}
};

const createDefaultEntities = async (
	serviceRequest: ReturnType<typeof toServiceRequestMock>,
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
		await generateEntities({serviceRequest, nextPersona, space});
	}
};

const generateEntity = async (
	ctx: SeedContext,
	data: EntityData,
	source_id = ctx.space.directory_id,
): Promise<CreateEntityResponse> => {
	const actor = ctx.nextPersona();
	return unwrap(
		await CreateEntityService.perform({
			...ctx.serviceRequest,
			actor,
			params: {
				actor: actor.persona_id,
				space_id: ctx.space.space_id,
				data,
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
		results.push(
			await generateEntity(
				ctx,
				typeof data === 'string' ? {type: 'Note', content: data} : data,
				source_id,
			),
		);
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
		roles: [
			{
				name: 'Steward',
				creator: true,
				policies: [
					{permission: 'UpdateCommunitySettings'},
					{permission: 'DeleteCommunity'},
					{permission: 'InviteToCommunity'},
				],
			},
			{
				name: 'Member',
				default: true,
				policies: [{permission: 'InviteToCommunity'}],
			},
		],
	},
];

interface SeedContext {
	serviceRequest: ReturnType<typeof toServiceRequestMock>;
	nextPersona: () => AccountPersona;
	space: Space;
}

const SEED_BY_VIEW_NAME: Record<string, (ctx: SeedContext) => Promise<void>> = {
	Chat: async (ctx) => {
		await generateEntities(ctx, ['Those who know do not speak.', 'Those who speak do not know.']);
	},
	Board: async (ctx) => {
		await generateEntities(ctx, [
			"All the world's a stage.",
			'And all the men and women merely players.',
		]);
	},
	Forum: async (ctx) => {
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
	serviceRequest: ReturnType<typeof toServiceRequestMock>,
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
				...serviceRequest,
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
