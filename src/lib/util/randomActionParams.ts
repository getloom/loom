import {randomBool} from '@feltjs/util/random.js';

import {
	randomEntityData,
	randomEntityParams,
	randomAssignmentParams,
	randomString,
	randomPersonaParams,
	randomSpaceParams,
	randomSpaceName,
	randomHubParams,
	randomRoleName,
	randomPermissionName,
	randomAccountName,
	randomPassword,
} from '$lib/util/randomVocab';
import {randomHue} from '$lib/ui/color';
import type {RandomEventParams} from '$lib/util/randomActionParamsTypes';

/* eslint-disable no-param-reassign */

export const randomActionParams: RandomEventParams = {
	Ping: async () => {
		return null;
	},
	Ephemera: async (random, {space, persona, account, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, hub));
		return {
			actor: persona.persona_id,
			space_id: space.space_id,
			data: {type: 'a'},
		};
	},
	SetSession: async () => {
		return {session: {guest: true}};
	},
	SignIn: async (random, {account} = {}) => {
		if (!account) account = await random.account();
		return {
			username: account.name,
			password: account.__testPlaintextPassword,
		};
	},
	SignOut: async () => {
		return null;
	},
	SignUp: async () => {
		return {
			username: randomAccountName(),
			password: randomString(),
		};
	},
	UpdateAccountSettings: async () => {
		return {
			settings: {darkmode: randomBool()},
		};
	},
	UpdateAccountPassword: async (random, {account} = {}) => {
		if (!account) account = await random.account();
		return {
			oldPassword: account.__testPlaintextPassword,
			newPassword: randomPassword(),
		};
	},
	CreateHub: async (random, {account, persona} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return randomHubParams(persona.persona_id);
	},
	UpdateHubSettings: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(persona, account));
		return {
			actor: persona.persona_id,
			hub_id: hub.hub_id,
			settings: {...hub.settings, hue: randomHue()},
		};
	},
	ReadHub: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(persona, account));
		return {actor: persona.persona_id, hub_id: hub.hub_id};
	},
	DeleteHub: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(persona, account));
		return {actor: persona.persona_id, hub_id: hub.hub_id};
	},
	InviteToHub: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(persona, account));
		return {
			actor: persona.persona_id,
			hub_id: hub.hub_id,
			name: (await random.persona(account)).persona.name,
		};
	},
	LeaveHub: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(persona, account));
		return {
			actor: persona.persona_id,
			targetActor: persona.persona_id,
			hub_id: hub.hub_id,
		};
	},
	KickFromHub: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(persona, account));
		return {
			actor: persona.persona_id,
			targetActor: persona.persona_id,
			hub_id: hub.hub_id,
		};
	},
	CreateAccountActor: async () => {
		return randomPersonaParams();
	},
	DeletePersona: async (random, {account, persona} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return {actor: persona.persona_id, targetActor: persona.persona_id};
	},
	CreateAssignment: async (random, {account, actor, persona, hub} = {}) => {
		if (!actor) ({persona: actor} = await random.persona(account));
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(actor)); // don't forward `persona`/`account` bc then it'll already have an assignment in hub
		return randomAssignmentParams(
			actor.persona_id,
			persona.persona_id,
			hub.hub_id,
			hub.settings.defaultRoleId,
		);
	},
	DeleteAssignment: async (random, {account, persona, hub, assignments} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub, assignments} = await random.hub(persona));
		//TODO create random assignment, sorry future me
		const assignment =
			assignments!.find((a) => a.persona_id === persona!.persona_id) || assignments![0];
		return {
			actor: persona.persona_id,
			assignment_id: assignment.assignment_id,
		};
	},
	CreateSpace: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(persona, account));
		return randomSpaceParams(persona.persona_id, hub.hub_id);
	},
	UpdateSpace: async (random, {account, persona, hub, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, hub));
		return {actor: persona.persona_id, space_id: space.space_id, name: randomSpaceName()};
	},
	DeleteSpace: async (random, {account, persona, hub, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, hub));
		return {actor: persona.persona_id, space_id: space.space_id};
	},
	ReadSpaces: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(persona, account));
		return {actor: persona.persona_id, hub_id: hub.hub_id};
	},
	CreateEntity: async (random, {account, persona, hub, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, hub));
		return randomEntityParams(persona.persona_id, space.space_id, space.directory_id);
	},
	ReadEntities: async (random, {account, persona, hub, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, hub));
		return {actor: persona.persona_id, source_id: space.directory_id};
	},
	ReadEntitiesPaginated: async (random, {account, persona, hub, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, hub));
		return {actor: persona.persona_id, source_id: space.directory_id, related: 'both'};
	},
	QueryEntities: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return {
			actor: persona.persona_id,
			source_id: (await random.space(persona, account, hub)).space.directory_id,
		};
	},
	ReadEntitiesById: async (random, {account, persona, hub, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return {
			actor: persona.persona_id,
			entityIds: [
				(await random.entity(persona, account, hub, space, space?.directory_id)).entity.entity_id,
			],
		};
	},
	UpdateEntities: async (random, {account, persona, hub, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return {
			actor: persona.persona_id,
			entities: [
				{
					entity_id: (await random.entity(persona, account, hub, space, space?.directory_id)).entity
						.entity_id,
					data: randomEntityData(),
				},
				{
					entity_id: (await random.entity(persona, account, hub, space, space?.directory_id)).entity
						.entity_id,
					data: randomEntityData(),
				},
			],
		};
	},
	EraseEntities: async (random, {account, persona, hub, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		const entity1 = await random.entity(persona, account, hub, space, space?.directory_id);
		const entity2 = await random.entity(persona, account, hub, space, space?.directory_id);
		return {
			actor: persona.persona_id,
			entityIds: [entity1.entity.entity_id, entity2.entity.entity_id],
		};
	},
	DeleteEntities: async (random, {account, persona, hub, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		const entity1 = await random.entity(persona, account, hub, space, space?.directory_id);
		const entity2 = await random.entity(persona, account, hub, space, space?.directory_id);
		return {
			actor: persona.persona_id,
			entityIds: [entity1.entity.entity_id, entity2.entity.entity_id],
		};
	},
	CreateRole: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(persona, account));
		return {
			actor: persona.persona_id,
			hub_id: hub.hub_id,
			name: randomRoleName(),
		};
	},
	ReadRoles: async (random, {account, persona, hub} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!hub) ({hub} = await random.hub(persona, account));
		return {actor: persona.persona_id, hub_id: hub.hub_id};
	},
	UpdateRole: async (random, {account, persona, hub, role} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!role) ({role} = await random.role(hub, persona, account));
		return {actor: persona.persona_id, role_id: role.role_id, name: randomRoleName()};
	},
	DeleteRole: async (random, {account, persona, hub, role} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!role) ({role} = await random.role(hub, persona, account));
		return {actor: persona.persona_id, role_id: role.role_id};
	},
	CreatePolicy: async (random, {account, persona, hub, role} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!role) ({role} = await random.role(hub, persona, account));
		return {actor: persona.persona_id, role_id: role.role_id, permission: randomPermissionName()};
	},
	ReadPolicies: async (random, {account, persona, hub, role} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!role) ({role} = await random.role(hub, persona, account));
		return {actor: persona.persona_id, role_id: role.role_id};
	},
	UpdatePolicy: async (random, {account, persona, hub, policy} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!policy) ({policy} = await random.policy(hub, persona, account));
		return {
			actor: persona.persona_id,
			policy_id: policy.policy_id,
			data: {},
		};
	},
	DeletePolicy: async (random, {account, persona, hub, policy} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!policy) ({policy} = await random.policy(hub, persona, account));
		return {
			actor: persona.persona_id,
			policy_id: policy.policy_id,
		};
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
	ViewSpace: async (random, {account, persona, hub} = {}) => {
		return {
			space_id: (await random.space(persona, account, hub)).space.space_id,
			view: '<EntityExplorer />',
		};
	},
	ClearFreshness: async (random, {account, persona, hub} = {}) => {
		return {
			directory_id: (await random.space(persona, account, hub)).space.directory_id,
		};
	},
};
