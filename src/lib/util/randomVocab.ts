import {unwrap} from '@feltcoop/util';

import type {Space} from '$lib/vocab/space/space';
import type {Community} from '$lib/vocab/community/community';
import type {Account} from '$lib/vocab/account/account';
import type {AccountPersona, ClientPersona} from '$lib/vocab/persona/persona';
import type {
	CreateCommunityParams,
	CreateAccountPersonaParams,
	CreateEntityParams,
	CreateSpaceParams,
	CreateAssignmentParams,
	CreateTieParams,
	CreateRoleParams,
	SignInParams,
	CreatePolicyParams,
} from '$lib/app/eventTypes';
import type {Database} from '$lib/db/Database';
import type {DirectoryEntityData, EntityData} from '$lib/vocab/entity/entityData';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Tie} from '$lib/vocab/tie/tie';
import {CreateAccountPersonaService} from '$lib/vocab/persona/personaServices';
import {CreateCommunityService} from '$lib/vocab/community/communityServices';
import {CreateSpaceService} from '$lib/vocab/space/spaceServices';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {CreateEntityService} from '$lib/vocab/entity/entityServices';
import {CreateTieService} from '$lib/vocab/tie/tieServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import type {Role} from '$lib/vocab/role/role';
import {CreateRoleService} from '$lib/vocab/role/roleServices';
import {toDefaultAccountSettings} from '$lib/vocab/account/accountHelpers.server';
import {randomHue} from '$lib/ui/color';
import type {Policy} from '$lib/vocab/policy/policy';
import {CreatePolicyService} from '$lib/vocab/policy/policyServices';
import {randomItem} from '@feltcoop/util/random.js';
import {permissionNames} from '$lib/vocab/policy/permissions';

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
export const randomPersonaParams = (): CreateAccountPersonaParams => ({
	name: randomPersonaName(),
});
export const randomAssignmentParams = (
	actor: number,
	persona_id: number,
	community_id: number,
	role_id: number,
): CreateAssignmentParams => ({
	actor,
	persona_id,
	community_id,
	role_id,
});
export const randomCommunityParams = (actor: number): CreateCommunityParams => {
	const name = randomCommunnityName();
	return {actor, template: {name, settings: {hue: randomHue(name)}}};
};
export const randomSpaceParams = (actor: number, community_id: number): CreateSpaceParams => ({
	actor,
	community_id,
	view: randomView(),
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
export const randomTieParams = (
	actor: number,
	source_id: number,
	dest_id: number,
): CreateTieParams => ({
	actor,
	source_id,
	dest_id,
	type: randomTieType(),
});

export const randomRoleParams = (actor: number, community_id: number): CreateRoleParams => ({
	actor,
	community_id,
	name: randomRoleName(),
});

export const randomPolicyParams = (
	actor: number,
	role_id: number,
	permission?: string,
): CreatePolicyParams => ({
	actor,
	role_id,
	permission: permission || randomPermissionName(),
});

// TODO maybe compute in relation to `RandomVocabContext`
export interface RandomVocab {
	account?: RandomTestAccount;
	actor?: AccountPersona;
	persona?: AccountPersona;
	community?: Community;
	space?: Space;
	entity?: Entity;
	role?: Role;
	policy?: Policy;
	assignments?: Assignment[];
}

/* eslint-disable no-param-reassign */

// TODO generate from schema
// TODO replace db.repos calls w/ service calls (see persona/community creation)
export class RandomVocabContext {
	constructor(private readonly db: Database) {}

	async account(params = randomAccountParams()): Promise<RandomTestAccount> {
		const account = unwrap(
			await this.db.repos.account.create(
				params.username,
				params.password,
				toDefaultAccountSettings(),
			),
		) as RandomTestAccount;
		// This makes the unencrypted password available for tests,
		// so things like `SignIn` can be tested with existing accounts.
		account.__testPlaintextPassword = params.password;
		return account;
	}

	async persona(account?: Account): Promise<{
		persona: AccountPersona;
		personalCommunity: Community;
		assignment: Assignment;
		spaces: Space[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		const {
			personas: [persona],
			communities: [personalCommunity],
			assignments: [assignment],
			spaces,
		} = unwrap(
			await CreateAccountPersonaService.perform({
				...toServiceRequestMock(this.db, undefined, undefined, account.account_id),
				params: {name: randomPersonaParams().name},
			}),
		);
		return {persona: persona as AccountPersona, personalCommunity, assignment, spaces, account};
	}

	async community(
		persona?: AccountPersona,
		account?: Account,
	): Promise<{
		community: Community;
		roles: Role[];
		policies: Policy[];
		assignments: Assignment[];
		spaces: Space[];
		persona: AccountPersona;
		personas: ClientPersona[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona, account} = await this.persona(account));
		const params = randomCommunityParams(persona.persona_id);
		const {community, roles, policies, personas, assignments, spaces} = unwrap(
			await CreateCommunityService.perform({
				...toServiceRequestMock(this.db, persona),
				params,
			}),
		);
		return {
			community,
			roles,
			policies,
			assignments,
			spaces,
			persona,
			personas: personas.concat(persona),
			account,
		};
	}

	async space(
		persona?: AccountPersona,
		account?: Account,
		community?: Community,
	): Promise<{
		space: Space;
		directory: Entity & {data: DirectoryEntityData};
		persona: AccountPersona;
		account: Account;
		community: Community;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!community) ({community} = await this.community(persona, account));
		const params = randomSpaceParams(persona.persona_id, community.community_id);
		const {space, directory} = unwrap(
			await CreateSpaceService.perform({
				...toServiceRequestMock(this.db, persona),
				params,
			}),
		);
		return {space, directory, persona, account, community};
	}

	async entity(
		persona?: AccountPersona,
		account?: Account,
		community?: Community,
		space?: Space,
		source_id?: number,
		paramsPartial?: Partial<CreateEntityParams>,
	): Promise<{
		entity: Entity;
		directories: Entity[];
		persona: AccountPersona;
		account: Account;
		community: Community;
		space: Space;
		ties: Tie[];
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!community) ({community} = await this.community(persona, account));
		// TODO create assignment on the fly here (`this.assignment`?) if needed to `community.settings.defaultRoleId`, and return it
		if (!space) ({space} = await this.space(persona, account, community));
		if (!source_id) {
			source_id = space.directory_id;
		}
		const {
			entities: [entity, ...directories],
			ties,
		} = unwrap(
			await CreateEntityService.perform({
				...toServiceRequestMock(this.db, persona),
				params: {
					...randomEntityParams(persona.persona_id, space.space_id, source_id),
					...paramsPartial,
				},
			}),
		);
		return {entity, persona, account, community, space, directories, ties};
	}

	async tie(
		sourceEntity?: Entity,
		destEntity?: Entity,
		persona?: AccountPersona,
		account?: Account,
		community?: Community,
		space?: Space,
		parentSourceId?: number, // optional directory or other source id for the source and dest entities (not the tie)
		type?: Tie['type'],
	): Promise<{
		tie: Tie;
		sourceEntity: Entity;
		destEntity: Entity;
		persona: AccountPersona;
		account: Account;
		community: Community;
		parentSourceId: number;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!community) ({community} = await this.community(persona, account));
		if (!space) ({space} = await this.space(persona, account, community));
		if (!parentSourceId) {
			parentSourceId = space.directory_id;
		}
		if (!sourceEntity) {
			({entity: sourceEntity} = await this.entity(
				persona,
				account,
				community,
				space,
				parentSourceId,
			));
		}
		if (!destEntity) {
			({entity: destEntity} = await this.entity(
				persona,
				account,
				community,
				space,
				parentSourceId,
			));
		}
		const params = randomTieParams(
			persona.persona_id,
			sourceEntity.entity_id,
			destEntity.entity_id,
		);
		if (type) params.type = type;
		const {tie} = unwrap(
			await CreateTieService.perform({
				...toServiceRequestMock(this.db, persona),
				params,
			}),
		);
		return {tie, sourceEntity, destEntity, persona, account, community, parentSourceId};
	}

	async role(
		community?: Community,
		persona?: AccountPersona,
		account?: Account,
	): Promise<{
		role: Role;
		persona: AccountPersona;
		account: Account;
		community: Community;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!community) ({community} = await this.community(persona, account));
		const params = randomRoleParams(persona.persona_id, community.community_id);
		const {role} = unwrap(
			await CreateRoleService.perform({
				...toServiceRequestMock(this.db, persona),
				params,
			}),
		);
		return {role, persona, account, community};
	}

	async policy(
		community?: Community,
		persona?: AccountPersona,
		account?: Account,
		permission?: string,
	): Promise<{
		policy: Policy;
		persona: AccountPersona;
		account: Account;
		community: Community;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!community) ({community} = await this.community(persona, account));
		const params = randomPolicyParams(
			persona.persona_id,
			community.settings.defaultRoleId,
			permission,
		);
		const {policy} = unwrap(
			await CreatePolicyService.perform({
				...toServiceRequestMock(this.db, persona),
				params,
			}),
		);
		return {policy, persona, account, community};
	}
}

// TODO better way to do this? and where does this belong? maybe @feltcoop/util/string.js?
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
