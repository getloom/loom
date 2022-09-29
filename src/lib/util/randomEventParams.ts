import {randomBool} from '@feltcoop/felt/util/random.js';

import {
	randomEntityData,
	randomEntityParams,
	randomMembershipParams,
	randomString,
	randomPersonaParams,
	randomSpaceParams,
	randomSpaceName,
	randomCommunityParams,
	randomRoleName,
} from '$lib/util/randomVocab';
import {randomHue} from '$lib/ui/color';
import type {RandomEventParams} from '$lib/util/randomEventParamsTypes';

/* eslint-disable no-param-reassign */

export const randomEventParams: RandomEventParams = {
	Ping: async () => {
		return null;
	},
	Ephemera: async (random, {space, persona, account, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, community));
		return {
			actor: persona?.persona_id,
			space_id: space.space_id,
			data: {type: 'a'},
		};
	},
	Login: async () => {
		return {
			username: randomString(),
			password: randomString(),
		};
	},
	Logout: async () => {
		return null;
	},
	SetSession: async () => {
		return {session: {guest: true}};
	},
	UpdateAccountSettings: async () => {
		return {
			settings: {darkmode: randomBool()},
		};
	},
	CreateCommunity: async (random, {account, persona} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return randomCommunityParams(persona.persona_id);
	},
	UpdateCommunitySettings: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community(persona, account));
		return {
			actor: persona.persona_id,
			community_id: community.community_id,
			settings: {hue: randomHue()},
		};
	},
	ReadCommunity: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community(persona, account));
		return {actor: persona.persona_id, community_id: community.community_id};
	},
	DeleteCommunity: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community(persona, account));
		return {actor: persona.persona_id, community_id: community.community_id};
	},
	ReadCommunities: async (random, {account, persona} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return {actor: persona.persona_id};
	},
	CreateAccountPersona: async () => {
		return randomPersonaParams();
	},
	ReadPersona: async (random, {persona} = {}) => {
		if (!persona) ({persona} = await random.persona());
		return {actor: persona.persona_id, persona_id: persona.persona_id};
	},
	CreateMembership: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community()); // don't forward `persona`/`account` bc that's the service's job
		return randomMembershipParams(persona.persona_id, persona.persona_id, community.community_id);
	},
	DeleteMembership: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community(persona));
		return {
			actor: persona.persona_id,
			persona_id: persona.persona_id,
			community_id: community.community_id,
		};
	},
	CreateSpace: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community(persona, account));
		return randomSpaceParams(persona.persona_id, community.community_id);
	},
	UpdateSpace: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, community));
		return {actor: persona.persona_id, space_id: space.space_id, name: randomSpaceName()};
	},
	DeleteSpace: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, community));
		return {actor: persona.persona_id, space_id: space.space_id};
	},
	ReadSpace: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, community));
		return {actor: persona.persona_id, space_id: space.space_id};
	},
	ReadSpaces: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community(persona, account));
		return {actor: persona.persona_id, community_id: community.community_id};
	},
	CreateEntity: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, community));
		return randomEntityParams(persona.persona_id, space.directory_id);
	},
	ReadEntities: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, community));
		return {actor: persona.persona_id, source_id: space.directory_id};
	},
	ReadEntitiesPaginated: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, community));
		return {actor: persona.persona_id, source_id: space.directory_id};
	},
	QueryEntities: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return {
			actor: persona.persona_id,
			source_id: (await random.space(persona, account, community)).space.directory_id,
		};
	},
	UpdateEntity: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return {
			actor: persona.persona_id,
			entity_id: (await random.entity(persona, account, community, space?.directory_id)).entity
				.entity_id,
			data: randomEntityData(),
		};
	},
	EraseEntities: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		const entity1 = await random.entity(persona, account, community, space?.directory_id);
		const entity2 = await random.entity(persona, account, community, space?.directory_id);
		return {
			actor: persona.persona_id,
			entityIds: [entity1.entity.entity_id, entity2.entity.entity_id],
		};
	},
	DeleteEntities: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		const entity1 = await random.entity(persona, account, community, space?.directory_id);
		const entity2 = await random.entity(persona, account, community, space?.directory_id);
		return {
			actor: persona.persona_id,
			entityIds: [entity1.entity.entity_id, entity2.entity.entity_id],
		};
	},
	CreateTie: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return {
			actor: persona.persona_id,
			source_id: (await random.entity(persona, account, community, space?.directory_id)).entity
				.entity_id,
			dest_id: (await random.entity(persona, account, community, space?.directory_id)).entity
				.entity_id,
			type: 'HasReply',
		};
	},
	ReadTies: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, community));
		return {actor: persona.persona_id, source_id: space.directory_id};
	},
	DeleteTie: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		const {tie} = await random.tie(
			undefined,
			undefined,
			persona,
			account,
			community,
			space?.directory_id,
		);
		return {
			actor: persona.persona_id,
			source_id: tie.source_id,
			dest_id: tie.dest_id,
			type: tie.type,
		};
	},
	CreateRole: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community(persona, account));
		return {
			actor: persona.persona_id,
			community_id: community.community_id,
			name: randomRoleName(),
		};
	},
	ReadRoles: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community(persona, account));
		return {actor: persona.persona_id, community_id: community.community_id};
	},
	UpdateRole: async (random, {account, persona, community, role} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!role) ({role} = await random.role(persona, account, community));
		return {actor: persona.persona_id, role_id: role.role_id, name: randomRoleName()};
	},
	DeleteRoles: async (random, {account, persona, community, role} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!role) ({role} = await random.role(persona, account, community));
		return {actor: persona.persona_id, roleIds: [role.role_id]};
	},

	ToggleMainNav: async () => {
		return undefined;
	},
	ToggleSecondaryNav: async () => {
		return undefined;
	},
	SetMobile: async () => {
		return randomBool();
	},
	OpenDialog: async () => {
		// TODO should use the `instanceof` `ajv-keywords` extension for this:
		// https://github.com/ajv-validator/ajv-keywords#instanceof
		// using the single keyword directly:
		// `require("ajv-keywords/dist/keywords/instanceof")(ajv, opts)`
		// and this value should be:
		// `class SomeComponent extends SvelteComponent {}`
		return {Component: {} as any};
	},
	CloseDialog: async () => {
		return undefined;
	},
	ViewSpace: async (random, {account, persona, community} = {}) => {
		return {
			space_id: (await random.space(persona, account, community)).space.space_id,
			view: '<EntityExplorer />',
		};
	},
	ClearFreshness: async (random, {account, persona, community} = {}) => {
		return {
			directory_id: (await random.space(persona, account, community)).space.directory_id,
		};
	},
};
