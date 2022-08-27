import {unwrap} from '@feltcoop/felt';

import type {Space} from '$lib/vocab/space/space';
import type {Community} from '$lib/vocab/community/community';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import type {Account} from '$lib/vocab/account/account';
import type {Persona} from '$lib/vocab/persona/persona';
import type {
	CreateCommunityParams,
	CreateAccountPersonaParams,
	CreateEntityParams,
	CreateSpaceParams,
	CreateMembershipParams,
	CreateTieParams,
	LoginParams,
} from '$lib/app/eventTypes';
import type {Database} from '$lib/db/Database';
import type {DirectoryEntityData, EntityData} from '$lib/vocab/entity/entityData';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Tie} from '$lib/vocab/tie/tie';
import {CreateAccountPersonaService} from '$lib/vocab/persona/personaServices';
import {CreateCommunityService} from '$lib/vocab/community/communityServices';
import {CreateSpaceService} from '$lib/vocab/space/spaceServices';
import type {Membership} from '$lib/vocab/membership/membership';
import {CreateEntityService} from '$lib/vocab/entity/entityServices';
import {CreateTieService} from '$lib/vocab/tie/tieServices';
import {toServiceRequestMock} from './testHelpers';

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
export const randomAccountParams = (): LoginParams => ({
	username: randomAccountName(),
	password: randomPassword(),
});
export const randomPersonaParams = (): CreateAccountPersonaParams => ({
	name: randomPersonaName(),
});
export const randomMembershipParams = (
	persona_id: number,
	community_id: number,
): CreateMembershipParams => ({
	persona_id,
	community_id,
});
export const randomCommunityParams = (persona_id: number): CreateCommunityParams => {
	const name = randomCommunnityName();
	return {
		name,
		persona_id,
		settings: toDefaultCommunitySettings(name),
	};
};
export const randomSpaceParams = (persona_id: number, community_id: number): CreateSpaceParams => ({
	persona_id,
	community_id,
	view: randomView(),
	name: randomSpaceName(),
	url: randomSpaceUrl(),
	icon: randomSpaceIcon(),
});
export const randomEntityParams = (persona_id: number, source_id: number): CreateEntityParams => ({
	persona_id,
	data: randomEntityData(),
	source_id,
});
export const randomTieParams = (source_id: number, dest_id: number): CreateTieParams => ({
	source_id,
	dest_id,
	type: randomTieType(),
});

// TODO maybe compute in relation to `RandomVocabContext`
export interface RandomVocab {
	account?: Account;
	persona?: Persona;
	community?: Community;
	space?: Space;
	entity?: Entity;
}

/* eslint-disable no-param-reassign */

// TODO generate from schema
// TODO replace db.repos calls w/ service calls (see persona/community creation)
export class RandomVocabContext {
	constructor(private readonly db: Database) {}

	async account(): Promise<Account> {
		const params = randomAccountParams();
		return unwrap(await this.db.repos.account.create(params.username, params.password));
	}

	async persona(account?: Account): Promise<{
		persona: Persona;
		personalCommunity: Community;
		membership: Membership;
		spaces: Space[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		const {
			persona,
			community: personalCommunity,
			membership,
			spaces,
		} = unwrap(
			await CreateAccountPersonaService.perform({
				...toServiceRequestMock(account.account_id, this.db),
				params: {name: randomPersonaParams().name},
			}),
		);
		return {persona, personalCommunity, membership, spaces, account};
	}

	async community(
		persona?: Persona,
		account?: Account,
	): Promise<{
		community: Community;
		memberships: Membership[];
		spaces: Space[];
		personas: Persona[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona, account} = await this.persona(account));
		const params = randomCommunityParams(persona.persona_id);
		const {community, personas, memberships, spaces} = unwrap(
			await CreateCommunityService.perform({
				...toServiceRequestMock(account.account_id, this.db),
				params,
			}),
		);
		return {community, memberships, spaces, personas: personas.concat(persona), account};
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
				...toServiceRequestMock(account.account_id, this.db),
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
				...toServiceRequestMock(account.account_id, this.db),
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
		const params = randomTieParams(sourceEntity.entity_id, destEntity.entity_id);
		if (type) params.type = type;
		const {tie} = unwrap(
			await CreateTieService.perform({
				...toServiceRequestMock(account.account_id, this.db),
				params,
			}),
		);
		return {tie, sourceEntity, destEntity, persona, account, community, parentSourceId};
	}
}
