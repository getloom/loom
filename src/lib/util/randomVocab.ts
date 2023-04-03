import {unwrap} from '@feltjs/util';

import type {Space} from '$lib/vocab/space/space';
import type {Hub, HubId} from '$lib/vocab/hub/hub';
import type {Account} from '$lib/vocab/account/account';
import type {AccountActor, ClientActor, PublicActor} from '$lib/vocab/actor/actor';
import type {
	CreateHubParams,
	CreateAccountActorParams,
	CreateEntityParams,
	CreateSpaceParams,
	CreateAssignmentParams,
	CreateRoleParams,
	SignInParams,
	CreatePolicyParams,
} from '$lib/app/actionTypes';
import type {Directory, EntityData} from '$lib/vocab/entity/entityData';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Tie} from '$lib/vocab/tie/tie';
import {CreateAccountActorService} from '$lib/vocab/actor/actorServices';
import {CreateHubService} from '$lib/vocab/hub/hubServices';
import {CreateSpaceService} from '$lib/vocab/space/spaceServices';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {CreateEntityService} from '$lib/vocab/entity/entityServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import type {Role, RoleId} from '$lib/vocab/role/role';
import {CreateRoleService} from '$lib/vocab/role/roleServices';
import {toDefaultAccountSettings} from '$lib/vocab/account/accountHelpers.server';
import {randomHue} from '$lib/ui/color';
import type {Policy} from '$lib/vocab/policy/policy';
import {CreatePolicyService} from '$lib/vocab/policy/policyServices';
import {randomItem} from '@feltjs/util/random.js';
import {permissionNames} from '$lib/vocab/policy/permissions';
import type {Repos} from '$lib/db/Repos';

export type RandomTestAccount = Account & {__testPlaintextPassword: string};

// TODO automate these from schemas, also use seeded rng
export const randomString = (): string => 'r' + Math.random().toString().slice(2);
export const randomAccountName = (): string => randomString() + '@email.com';
export const randomPassword = randomString;
export const randomPersonaName = randomString;
export const randomCommunnityName = randomString;
export const randomSpacePath = randomString;
export const randomSpaceIcon = (): string => '🥥';
export const randomSpaceName = randomString;
export const randomView = (): string => '<Chat />';
export const randomEntityData = (): EntityData => ({type: 'Note', content: randomString()});
export const randomTieType = randomString;
export const randomRoleName = randomString;
export const randomPermissionName = (): string => randomItem(permissionNames);
export const randomAccountParams = (): SignInParams => ({
	username: randomAccountName(),
	password: randomPassword(),
});
export const randomPersonaParams = (): CreateAccountActorParams => ({
	name: randomPersonaName(),
});
export const randomAssignmentParams = (
	actor: number,
	targetActor: number,
	hub_id: HubId,
	role_id: RoleId,
): CreateAssignmentParams => ({
	actor,
	targetActor,
	hub_id,
	role_id,
});
export const randomHubParams = (actor: number): CreateHubParams => {
	const name = randomCommunnityName();
	return {actor, template: {name, settings: {hue: randomHue(name)}}};
};
export const randomSpaceParams = (
	actor: number,
	hub_id: HubId,
	view?: string,
): CreateSpaceParams => ({
	actor,
	hub_id,
	view: view ?? randomView(),
	name: randomSpaceName(),
	path: randomSpacePath(),
	icon: randomSpaceIcon(),
});
export const randomEntityParams = (
	actor: number,
	space_id: number,
	source_id: number,
): CreateEntityParams => ({
	actor,
	space_id,
	data: randomEntityData(),
	ties: [{source_id}],
});

export const randomRoleParams = (actor: number, hub_id: HubId): CreateRoleParams => ({
	actor,
	hub_id,
	name: randomRoleName(),
});

export const randomPolicyParams = (
	actor: number,
	role_id: RoleId,
	permission?: string,
): CreatePolicyParams => ({
	actor,
	role_id,
	permission: permission || randomPermissionName(),
});

// TODO maybe compute in relation to `RandomVocabContext`
export interface RandomVocab {
	account?: RandomTestAccount;
	actor?: AccountActor;
	persona?: AccountActor;
	hub?: Hub;
	space?: Space;
	entity?: Entity;
	role?: Role;
	policy?: Policy;
	assignments?: Assignment[];
}

/* eslint-disable no-param-reassign */

// TODO generate from schema
// TODO replace db.repos calls w/ service calls (see persona/hub creation)
export class RandomVocabContext {
	constructor(public readonly repos: Repos) {}

	async account(params = randomAccountParams()): Promise<RandomTestAccount> {
		const account = (await this.repos.account.create(
			params.username,
			params.password,
			toDefaultAccountSettings(),
		)) as RandomTestAccount;
		// This makes the unencrypted password available for tests,
		// so things like `SignIn` can be tested with existing accounts.
		account.__testPlaintextPassword = params.password;
		return account;
	}

	async persona(account?: Account): Promise<{
		persona: AccountActor;
		personalHub: Hub;
		assignment: Assignment;
		spaces: Space[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		const {
			personas: [persona],
			hubs: [personalHub],
			assignments: [assignment],
			spaces,
		} = unwrap(
			await CreateAccountActorService.perform({
				...toServiceRequestMock(this.repos, undefined, undefined, account.account_id),
				params: {name: randomPersonaParams().name},
			}),
		);
		return {persona: persona as AccountActor, personalHub, assignment, spaces, account};
	}

	async hub(
		persona?: AccountActor,
		account?: Account,
	): Promise<{
		hub: Hub;
		roles: Role[];
		policies: Policy[];
		assignments: Assignment[];
		spaces: Space[];
		persona: AccountActor;
		hubPersona: PublicActor;
		personas: ClientActor[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona, account} = await this.persona(account));
		const params = randomHubParams(persona.persona_id);
		const {hub, roles, policies, personas, assignments, spaces} = unwrap(
			await CreateHubService.perform({
				...toServiceRequestMock(this.repos, persona),
				params,
			}),
		);
		const hubPersona = personas.find((p) => p.name === hub.name)!;
		return {
			hub,
			roles,
			policies,
			assignments,
			spaces,
			persona,
			hubPersona,
			personas: personas.concat(persona),
			account,
		};
	}

	async space(
		persona?: AccountActor,
		account?: Account,
		hub?: Hub,
		view?: string,
	): Promise<{
		space: Space;
		directory: Directory;
		persona: AccountActor;
		account: Account;
		hub: Hub;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!hub) ({hub} = await this.hub(persona, account));
		const params = randomSpaceParams(persona.persona_id, hub.hub_id, view);
		const {space, directory} = unwrap(
			await CreateSpaceService.perform({
				...toServiceRequestMock(this.repos, persona),
				params,
			}),
		);
		return {space, directory, persona, account, hub};
	}

	async entity(
		persona?: AccountActor,
		account?: Account,
		hub?: Hub,
		space?: Space,
		source_id?: number,
		paramsPartial?: Partial<CreateEntityParams>,
	): Promise<{
		entity: Entity;
		directories: Entity[];
		persona: AccountActor;
		account: Account;
		hub: Hub;
		space: Space;
		ties: Tie[];
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!hub) ({hub} = await this.hub(persona, account));
		// TODO create assignment on the fly here (`this.assignment`?) if needed to `hub.settings.defaultRoleId`, and return it
		if (!space) ({space} = await this.space(persona, account, hub));
		if (!source_id) {
			source_id = space.directory_id;
		}
		const {
			entities: [entity, ...directories],
			ties,
		} = unwrap(
			await CreateEntityService.perform({
				...toServiceRequestMock(this.repos, persona),
				params: {
					...randomEntityParams(persona.persona_id, space.space_id, source_id),
					...paramsPartial,
				},
			}),
		);
		return {entity, persona, account, hub, space, directories, ties};
	}

	async tie(
		sourceEntity?: Entity,
		destEntity?: Entity,
		persona?: AccountActor,
		account?: Account,
		hub?: Hub,
		space?: Space,
		parentSourceId?: number, // optional directory or other source id for the source and dest entities (not the tie)
		type?: Tie['type'],
	): Promise<{
		tie: Tie;
		sourceEntity: Entity;
		destEntity: Entity;
		persona: AccountActor;
		account: Account;
		hub: Hub;
		parentSourceId: number;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!hub) ({hub} = await this.hub(persona, account));
		if (!space) ({space} = await this.space(persona, account, hub));
		if (!parentSourceId) {
			parentSourceId = space.directory_id;
		}
		if (!sourceEntity) {
			({entity: sourceEntity} = await this.entity(persona, account, hub, space, parentSourceId));
		}
		if (!destEntity) {
			({entity: destEntity} = await this.entity(persona, account, hub, space, parentSourceId));
		}

		const tie = await this.repos.tie.create(
			sourceEntity.entity_id,
			sourceEntity.entity_id,
			type || randomTieType(),
		);
		return {tie, sourceEntity, destEntity, persona, account, hub, parentSourceId};
	}

	async role(
		hub?: Hub,
		persona?: AccountActor,
		account?: Account,
	): Promise<{
		role: Role;
		persona: AccountActor;
		account: Account;
		hub: Hub;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!hub) ({hub} = await this.hub(persona, account));
		const params = randomRoleParams(persona.persona_id, hub.hub_id);
		const {role} = unwrap(
			await CreateRoleService.perform({
				...toServiceRequestMock(this.repos, persona),
				params,
			}),
		);
		return {role, persona, account, hub};
	}

	async policy(
		hub?: Hub,
		persona?: AccountActor,
		account?: Account,
		permission?: string,
	): Promise<{
		policy: Policy;
		persona: AccountActor;
		account: Account;
		hub: Hub;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!hub) ({hub} = await this.hub(persona, account));
		const params = randomPolicyParams(persona.persona_id, hub.settings.defaultRoleId, permission);
		const {policy} = unwrap(
			await CreatePolicyService.perform({
				...toServiceRequestMock(this.repos, persona),
				params,
			}),
		);
		return {policy, persona, account, hub};
	}
}

// TODO better way to do this? and where does this belong? maybe @feltjs/util/string.js?
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
