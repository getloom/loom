import {unwrap} from '@feltcoop/felt';

import type {Space} from '$lib/vocab/space/space';
import type {Community} from '$lib/vocab/community/community';
import type {Account} from '$lib/vocab/account/account';
import type {Persona} from '$lib/vocab/persona/persona';
import type {
	CreateCommunityParams,
	CreateAccountPersonaParams,
	CreateEntityParams,
	CreateSpaceParams,
	CreateAssignmentParams,
	CreateTieParams,
	CreateRoleParams,
	LoginParams,
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
import {toDefaultAccountSettings} from '$lib/vocab/account/account.schema';
import {randomHue} from '$lib/ui/color';

// TODO automate these from schemas, also use seeded rng
export const randomString = (): string => Math.random().toString().slice(2);
export const randomAccountName = randomString;
export const randomPassword = randomString;
export const randomPersonaName = randomString;
export const randomCommunnityName = randomString;
export const randomSpaceUrl = randomString;
export const randomSpaceIcon = (): string => '🥥';
export const randomSpaceName = randomString;
export const randomView = (): string => '<Room />';
export const randomEntityData = (): EntityData => ({type: 'Note', content: randomString()});
export const randomTieType = randomString;
export const randomRoleName = randomString;
export const randomAccountParams = (): LoginParams => ({
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
): CreateAssignmentParams => ({
	actor,
	persona_id,
	community_id,
});
export const randomCommunityParams = (actor: number): CreateCommunityParams => {
	const name = randomCommunnityName();
	return {
		name,
		actor,
		settings: {hue: randomHue(name)},
	};
};
export const randomSpaceParams = (actor: number, community_id: number): CreateSpaceParams => ({
	actor,
	community_id,
	view: randomView(),
	name: randomSpaceName(),
	url: randomSpaceUrl(),
	icon: randomSpaceIcon(),
});
export const randomEntityParams = (actor: number, source_id: number): CreateEntityParams => ({
	actor,
	data: randomEntityData(),
	source_id,
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

// TODO maybe compute in relation to `RandomVocabContext`
export interface RandomVocab {
	account?: Account;
	persona?: Persona;
	community?: Community;
	space?: Space;
	entity?: Entity;
	role?: Role;
}

/* eslint-disable no-param-reassign */

// TODO generate from schema
// TODO replace db.repos calls w/ service calls (see persona/community creation)
export class RandomVocabContext {
	constructor(private readonly db: Database) {}

	async account(): Promise<Account> {
		const params = randomAccountParams();
		return unwrap(
			await this.db.repos.account.create(
				params.username,
				params.password,
				toDefaultAccountSettings(),
			),
		);
	}

	async persona(account?: Account): Promise<{
		persona: Persona;
		personalCommunity: Community;
		assignment: Assignment;
		spaces: Space[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		const {
			persona,
			community: personalCommunity,
			assignment,
			spaces,
		} = unwrap(
			await CreateAccountPersonaService.perform({
				...toServiceRequestMock(this.db, undefined, undefined, account.account_id),
				params: {name: randomPersonaParams().name},
			}),
		);
		return {persona, personalCommunity, assignment, spaces, account};
	}

	async community(
		persona?: Persona,
		account?: Account,
	): Promise<{
		community: Community;
		role: Role;
		assignments: Assignment[];
		spaces: Space[];
		personas: Persona[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona, account} = await this.persona(account));
		const params = randomCommunityParams(persona.persona_id);
		const {community, role, personas, assignments, spaces} = unwrap(
			await CreateCommunityService.perform({
				...toServiceRequestMock(this.db, persona),
				params,
			}),
		);
		return {community, role, assignments, spaces, personas: personas.concat(persona), account};
	}

	async space(
		persona?: Persona,
		account?: Account,
		community?: Community,
	): Promise<{
		space: Space;
		directory: Entity & {data: DirectoryEntityData};
		persona: Persona;
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

	//TODO do we need space now? Should be source_id
	async entity(
		persona?: Persona,
		account?: Account,
		community?: Community,
		source_id?: number,
		paramsPartial?: Partial<CreateEntityParams>,
	): Promise<{
		entity: Entity;
		persona: Persona;
		account: Account;
		community: Community;
		tie: Tie;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!community) ({community} = await this.community(persona, account));
		if (!source_id) {
			const {space} = await this.space(persona, account, community);
			source_id = space.directory_id;
		}
		const {entity, tie} = unwrap(
			await CreateEntityService.perform({
				...toServiceRequestMock(this.db, persona),
				params: {
					...randomEntityParams(persona.persona_id, source_id),
					...paramsPartial,
				},
			}),
		);
		return {entity, persona, account, community, tie};
	}

	async tie(
		sourceEntity?: Entity,
		destEntity?: Entity,
		persona?: Persona,
		account?: Account,
		community?: Community,
		parentSourceId?: number, // optional directory or other source id for the source and dest entities (not the tie)
		type?: Tie['type'],
	): Promise<{
		tie: Tie;
		sourceEntity: Entity;
		destEntity: Entity;
		persona: Persona;
		account: Account;
		community: Community;
		parentSourceId: number;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!community) ({community} = await this.community(persona, account));
		if (!parentSourceId) {
			const {space} = await this.space(persona, account, community);
			parentSourceId = space.directory_id;
		}
		if (!sourceEntity) {
			({entity: sourceEntity} = await this.entity(persona, account, community, parentSourceId));
		}
		if (!destEntity) {
			({entity: destEntity} = await this.entity(persona, account, community, parentSourceId));
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
		persona?: Persona,
		account?: Account,
	): Promise<{
		role: Role;
		persona: Persona;
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
}
