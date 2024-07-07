import {unwrap} from '@ryanatkn/belt/result.js';

import type {Space, SpaceId} from '$lib/vocab/space/space.js';
import type {Hub, HubId} from '$lib/vocab/hub/hub.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {
	AccountActor,
	ActionActor,
	ActorId,
	ClientActor,
	PublicActor,
} from '$lib/vocab/actor/actor.js';
import type {
	CreateHubParams,
	CreateAccountActorParams,
	CreateEntityParams,
	CreateSpaceParams,
	CreateAssignmentParams,
	CreateRoleParams,
	SignInParams,
	CreatePolicyParams,
} from '$lib/vocab/action/actionTypes.js';
import type {Directory, EntityData} from '$lib/vocab/entity/entityData.js';
import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
import type {Tie} from '$lib/vocab/tie/tie.js';
import {CreateAccountActorService} from '$lib/vocab/actor/actorServices.js';
import {CreateHubService, InviteToHubService} from '$lib/vocab/hub/hubServices.js';
import {CreateSpaceService} from '$lib/vocab/space/spaceServices.js';
import type {Assignment} from '$lib/vocab/assignment/assignment.js';
import {CreateEntityService} from '$lib/vocab/entity/entityServices.js';
import {passwordHasherFake, toServiceRequestFake} from '$lib/util/testHelpers.js';
import type {Role, RoleId} from '$lib/vocab/role/role.js';
import {CreateRoleService} from '$lib/vocab/role/roleServices.js';
import {
	ACCOUNT_COLUMNS,
	toDefaultAccountSettings,
} from '$lib/vocab/account/accountHelpers.server.js';
import {randomHue} from '$lib/util/color.js';
import type {Policy, PolicyName} from '$lib/vocab/policy/policy.js';
import {CreatePolicyService} from '$lib/vocab/policy/policyServices.js';
import {random_item} from '@ryanatkn/belt/random.js';
import {policyNames} from '$lib/vocab/policy/policyHelpers.js';
import type {Repos} from '$lib/db/Repos.js';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';
import {ADMIN_ACTOR_ID, ADMIN_HUB_ID} from './constants';

export type RandomTestAccount = Account & {__testPlaintextPassword: string};

// TODO automate these from schemas, also use seeded rng
export const randomString = (): string => 'r' + Math.random().toString().slice(2);
export const randomAccountName = (): string => randomString() + '@email.com';
export const randomPassword = randomString;
export const randomActorName = randomString;
export const randomCommunnityName = randomString;
export const randomSpaceIcon = (): string => '🥥';
export const randomSpaceName = randomString;
export const randomView = (): string => '<Chat />';
export const randomEntityData = (): EntityData => ({content: randomString()});
export const randomTieType = randomString;
export const randomRoleName = randomString;
export const randomPolicyName = (): PolicyName => random_item(policyNames);
export const randomAccountParams = (): SignInParams => ({
	username: randomAccountName(),
	password: randomPassword(),
});
export const randomActorParams = (): CreateAccountActorParams => ({
	name: randomActorName(),
});
export const randomAssignmentParams = (
	actor: ActorId,
	actor_id: ActorId,
	hub_id: HubId,
	role_id: RoleId,
): CreateAssignmentParams => ({
	actor,
	actor_id,
	hub_id,
	role_id,
});
export const randomHubParams = (actor: ActorId): CreateHubParams => {
	const name = randomCommunnityName();
	return {actor, template: {name, settings: {hue: randomHue(name)}}};
};
export const randomSpaceParams = (
	actor: ActorId,
	hub_id: HubId,
	view?: string,
): CreateSpaceParams => ({
	actor,
	hub_id,
	view: view ?? randomView(),
	name: randomSpaceName(),
	icon: randomSpaceIcon(),
});
export const randomEntityParams = (
	actor: ActorId,
	space_id: SpaceId,
	source_id: EntityId,
): CreateEntityParams => ({
	actor,
	space_id,
	data: randomEntityData(),
	ties: [{source_id}],
});

export const randomRoleParams = (actor: ActorId, hub_id: HubId): CreateRoleParams => ({
	actor,
	hub_id,
	name: randomRoleName(),
});

export const randomPolicyParams = (
	actor: ActorId,
	role_id: RoleId,
	name?: PolicyName,
): CreatePolicyParams => ({
	actor,
	role_id,
	name: name || randomPolicyName(),
});

// TODO maybe compute in relation to `RandomVocabContext`
export interface RandomVocab {
	account?: RandomTestAccount;
	actor?: AccountActor;
	hub?: Hub;
	space?: Space;
	entity?: Entity;
	role?: Role;
	policy?: Policy;
	assignments?: Assignment[];
}

/* eslint-disable no-param-reassign */

// TODO generate from schema
// TODO replace db.repos calls w/ service calls (see actor/hub creation)
export class RandomVocabContext {
	constructor(public readonly repos: Repos) {}

	async account(params = randomAccountParams()): Promise<RandomTestAccount> {
		const account = (await this.repos.account.create(
			passwordHasherFake,
			params.username,
			params.password,
			toDefaultAccountSettings(),
			ACCOUNT_COLUMNS.all,
		)) as RandomTestAccount;
		// This makes the unencrypted password available for tests,
		// so things like `SignIn` can be tested with existing accounts.
		account.__testPlaintextPassword = params.password;
		return account;
	}

	async actor(account?: Account): Promise<{
		actor: AccountActor;
		personalHub: Hub;
		assignment: Assignment;
		spaces: Space[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		const {
			actors: [actor],
			hubs: [personalHub],
			assignments: [assignment],
			spaces,
		} = unwrap(
			await CreateAccountActorService.perform({
				...toServiceRequestFake(this.repos, undefined, account.account_id),
				params: {name: randomActorParams().name},
			}),
		);
		return {actor: actor as AccountActor, personalHub, assignment, spaces, account};
	}

	async adminActor(
		account?: Account,
		actor?: AccountActor,
	): Promise<{
		actor: AccountActor;
	}> {
		const adminActor = (await this.repos.actor.findById(
			ADMIN_ACTOR_ID,
			ACTOR_COLUMNS.all,
		)) as ActionActor;
		if (!actor) ({actor, account} = await this.actor(account));
		unwrap(
			await InviteToHubService.perform({
				...toServiceRequestFake(this.repos, adminActor),
				params: {actor: actor.actor_id, hub_id: ADMIN_HUB_ID, name: actor.name},
			}),
		);
		return {
			actor,
		};
	}

	async hub(
		actor?: AccountActor,
		account?: Account,
	): Promise<{
		hub: Hub;
		roles: Role[];
		policies: Policy[];
		assignments: Assignment[];
		spaces: Space[];
		actor: AccountActor;
		hubActor: PublicActor;
		actors: ClientActor[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		if (!actor) ({actor, account} = await this.actor(account));
		const params = randomHubParams(actor.actor_id);
		const {hub, roles, policies, actors, assignments, spaces} = unwrap(
			await CreateHubService.perform({
				...toServiceRequestFake(this.repos, actor),
				params,
			}),
		);
		const hubActor = actors.find((p) => p.name === hub.name)!;
		return {
			hub,
			roles,
			policies,
			assignments,
			spaces,
			actor,
			hubActor,
			actors: actors.concat(actor),
			account,
		};
	}

	async space(
		actor?: AccountActor,
		account?: Account,
		hub?: Hub,
		view?: string,
	): Promise<{
		space: Space;
		directory: Directory;
		actor: AccountActor;
		account: Account;
		hub: Hub;
	}> {
		if (!account) account = await this.account();
		if (!actor) ({actor} = await this.actor(account));
		if (!hub) ({hub} = await this.hub(actor, account));
		const params = randomSpaceParams(actor.actor_id, hub.hub_id, view);
		const {space, directory} = unwrap(
			await CreateSpaceService.perform({
				...toServiceRequestFake(this.repos, actor),
				params,
			}),
		);
		return {space, directory, actor, account, hub};
	}

	async entity(
		actor?: AccountActor,
		account?: Account,
		hub?: Hub,
		space?: Space,
		source_id?: EntityId,
		paramsPartial?: Partial<CreateEntityParams>,
	): Promise<{
		entity: Entity;
		directories: Entity[];
		actor: AccountActor;
		account: Account;
		hub: Hub;
		space: Space;
		ties: Tie[];
	}> {
		if (!account) account = await this.account();
		if (!actor) ({actor} = await this.actor(account));
		if (!hub) ({hub} = await this.hub(actor, account));
		// TODO create assignment on the fly here (`this.assignment`?) if needed to `hub.settings.defaultRoleId`, and return it
		if (!space) ({space} = await this.space(actor, account, hub));
		if (!source_id) {
			source_id = space.directory_id;
		}
		const {
			entities: [entity, ...directories],
			ties,
		} = unwrap(
			await CreateEntityService.perform({
				...toServiceRequestFake(this.repos, actor),
				params: {
					...randomEntityParams(actor.actor_id, space.space_id, source_id),
					...paramsPartial,
				},
			}),
		);
		return {entity, actor, account, hub, space, directories, ties};
	}

	async tie(
		sourceEntity?: Entity,
		destEntity?: Entity,
		actor?: AccountActor,
		account?: Account,
		hub?: Hub,
		space?: Space,
		parentSourceId?: EntityId, // optional directory or other source id for the source and dest entities (not the tie)
		type?: Tie['type'],
	): Promise<{
		tie: Tie;
		sourceEntity: Entity;
		destEntity: Entity;
		actor: AccountActor;
		account: Account;
		hub: Hub;
		parentSourceId: EntityId;
	}> {
		if (!account) account = await this.account();
		if (!actor) ({actor} = await this.actor(account));
		if (!hub) ({hub} = await this.hub(actor, account));
		if (!space) ({space} = await this.space(actor, account, hub));
		if (!parentSourceId) {
			parentSourceId = space.directory_id;
		}
		if (!sourceEntity) {
			({entity: sourceEntity} = await this.entity(actor, account, hub, space, parentSourceId));
		}
		if (!destEntity) {
			({entity: destEntity} = await this.entity(actor, account, hub, space, parentSourceId));
		}

		const tie = await this.repos.tie.create(
			sourceEntity.entity_id,
			sourceEntity.entity_id,
			type || randomTieType(),
		);
		return {tie, sourceEntity, destEntity, actor, account, hub, parentSourceId};
	}

	async role(
		hub?: Hub,
		actor?: AccountActor,
		account?: Account,
	): Promise<{
		role: Role;
		actor: AccountActor;
		account: Account;
		hub: Hub;
	}> {
		if (!account) account = await this.account();
		if (!actor) ({actor} = await this.actor(account));
		if (!hub) ({hub} = await this.hub(actor, account));
		const params = randomRoleParams(actor.actor_id, hub.hub_id);
		const {role} = unwrap(
			await CreateRoleService.perform({
				...toServiceRequestFake(this.repos, actor),
				params,
			}),
		);
		return {role, actor, account, hub};
	}

	async policy(
		hub?: Hub,
		actor?: AccountActor,
		account?: Account,
		name?: PolicyName,
	): Promise<{
		policy: Policy;
		actor: AccountActor;
		account: Account;
		hub: Hub;
	}> {
		if (!account) account = await this.account();
		if (!actor) ({actor} = await this.actor(account));
		if (!hub) ({hub} = await this.hub(actor, account));
		const params = randomPolicyParams(actor.actor_id, hub.settings.defaultRoleId, name);
		const {policy} = unwrap(
			await CreatePolicyService.perform({
				...toServiceRequestFake(this.repos, actor),
				params,
			}),
		);
		return {policy, actor, account, hub};
	}
}

// TODO better way to do this? and where does this belong? maybe @ryanatkn/belt/string.js?
export const ALPHABET = [
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'u',
	'v',
	'w',
	'x',
	'y',
	'z',
];
