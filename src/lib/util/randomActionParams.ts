import {random_boolean} from '@grogarden/util/random.js';
import {SvelteComponent} from 'svelte';
import {to_dialog_params} from '@fuz.dev/fuz_dialog/dialog.js';

import {
	randomEntityData,
	randomEntityParams,
	randomAssignmentParams,
	randomString,
	randomActorParams,
	randomSpaceParams,
	randomSpaceName,
	randomHubParams,
	randomRoleName,
	randomPolicyName,
	randomAccountName,
	randomPassword,
} from '$lib/util/randomVocab.js';
import {randomHue} from '$lib/util/color.js';
import type {RandomActionParams} from '$lib/util/randomActionParamsTypes.js';

/* eslint-disable no-param-reassign */

export const randomActionParams: RandomActionParams = {
	Ping: async () => {
		return null;
	},
	Ephemera: async (random, {space, actor, account, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!space) ({space} = await random.space(actor, account, hub));
		return {
			actor: actor.actor_id,
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
			settings: {darkmode: random_boolean()},
		};
	},
	UpdateAccountPassword: async (random, {account} = {}) => {
		if (!account) account = await random.account();
		return {
			oldPassword: account.__testPlaintextPassword,
			newPassword: randomPassword(),
		};
	},
	CreateHub: async (random, {account, actor} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		return randomHubParams(actor.actor_id);
	},
	UpdateHub: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor, account));
		return {
			actor: actor.actor_id,
			hub_id: hub.hub_id,
			settings: {...hub.settings, hue: randomHue()},
		};
	},
	ReadHub: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor, account));
		return {actor: actor.actor_id, hub_id: hub.hub_id};
	},
	DeleteHub: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor, account));
		return {actor: actor.actor_id, hub_id: hub.hub_id};
	},
	InviteToHub: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor, account));
		return {
			actor: actor.actor_id,
			hub_id: hub.hub_id,
			name: (await random.actor(account)).actor.name,
		};
	},
	LeaveHub: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor, account));
		return {
			actor: actor.actor_id,
			actor_id: actor.actor_id,
			hub_id: hub.hub_id,
		};
	},
	KickFromHub: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor, account));
		return {
			actor: actor.actor_id,
			actor_id: actor.actor_id,
			hub_id: hub.hub_id,
		};
	},
	CreateAccountActor: async () => {
		return randomActorParams();
	},
	DeleteActor: async (random, {account, actor} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		return {actor: actor.actor_id, actor_id: actor.actor_id};
	},
	CreateAssignment: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor)); // don't forward `actor`/`account` bc then it'll already have an assignment in hub
		return randomAssignmentParams(
			actor.actor_id,
			actor.actor_id,
			hub.hub_id,
			hub.settings.defaultRoleId,
		);
	},
	DeleteAssignment: async (random, {account, actor, hub, assignments} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub, assignments} = await random.hub(actor));
		//TODO create random assignment, sorry future me
		const assignment = assignments!.find((a) => a.actor_id === actor!.actor_id) || assignments![0];
		return {
			actor: actor.actor_id,
			assignment_id: assignment.assignment_id,
		};
	},
	CreateSpace: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor, account));
		return randomSpaceParams(actor.actor_id, hub.hub_id);
	},
	UpdateSpace: async (random, {account, actor, hub, space} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!space) ({space} = await random.space(actor, account, hub));
		return {actor: actor.actor_id, space_id: space.space_id, name: randomSpaceName()};
	},
	DeleteSpace: async (random, {account, actor, hub, space} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!space) ({space} = await random.space(actor, account, hub));
		return {actor: actor.actor_id, space_id: space.space_id};
	},
	ReadSpaces: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor, account));
		return {actor: actor.actor_id, hub_id: hub.hub_id};
	},
	CreateEntity: async (random, {account, actor, hub, space} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!space) ({space} = await random.space(actor, account, hub));
		return randomEntityParams(actor.actor_id, space.space_id, space.directory_id);
	},
	ReadEntities: async (random, {account, actor, hub, space} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!space) ({space} = await random.space(actor, account, hub));
		return {actor: actor.actor_id, source_id: space.directory_id, related: 'both'};
	},
	ReadEntitiesById: async (random, {account, actor, hub, space} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		return {
			actor: actor.actor_id,
			entityIds: [
				(await random.entity(actor, account, hub, space, space?.directory_id)).entity.entity_id,
			],
		};
	},
	UpdateEntities: async (random, {account, actor, hub, space} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		return {
			actor: actor.actor_id,
			entities: [
				{
					entity_id: (await random.entity(actor, account, hub, space, space?.directory_id)).entity
						.entity_id,
					data: randomEntityData(),
				},
				{
					entity_id: (await random.entity(actor, account, hub, space, space?.directory_id)).entity
						.entity_id,
					data: randomEntityData(),
				},
			],
		};
	},
	EraseEntities: async (random, {account, actor, hub, space} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		const entity1 = await random.entity(actor, account, hub, space, space?.directory_id);
		const entity2 = await random.entity(actor, account, hub, space, space?.directory_id);
		return {
			actor: actor.actor_id,
			entityIds: [entity1.entity.entity_id, entity2.entity.entity_id],
		};
	},
	DeleteEntities: async (random, {account, actor, hub, space} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		const entity1 = await random.entity(actor, account, hub, space, space?.directory_id);
		const entity2 = await random.entity(actor, account, hub, space, space?.directory_id);
		return {
			actor: actor.actor_id,
			entityIds: [entity1.entity.entity_id, entity2.entity.entity_id],
		};
	},
	CreateRole: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor, account));
		return {
			actor: actor.actor_id,
			hub_id: hub.hub_id,
			name: randomRoleName(),
		};
	},
	ReadRoles: async (random, {account, actor, hub} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!hub) ({hub} = await random.hub(actor, account));
		return {actor: actor.actor_id, hub_id: hub.hub_id};
	},
	UpdateRole: async (random, {account, actor, hub, role} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!role) ({role} = await random.role(hub, actor, account));
		return {actor: actor.actor_id, role_id: role.role_id, name: randomRoleName()};
	},
	DeleteRole: async (random, {account, actor, hub, role} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!role) ({role} = await random.role(hub, actor, account));
		return {actor: actor.actor_id, role_id: role.role_id};
	},
	CreatePolicy: async (random, {account, actor, hub, role} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!role) ({role} = await random.role(hub, actor, account));
		return {actor: actor.actor_id, role_id: role.role_id, name: randomPolicyName()};
	},
	ReadPolicies: async (random, {account, actor, hub, role} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!role) ({role} = await random.role(hub, actor, account));
		return {actor: actor.actor_id, role_id: role.role_id};
	},
	UpdatePolicy: async (random, {account, actor, hub, policy} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!policy) ({policy} = await random.policy(hub, actor, account));
		return {
			actor: actor.actor_id,
			policy_id: policy.policy_id,
			data: {},
		};
	},
	DeletePolicy: async (random, {account, actor, hub, policy} = {}) => {
		if (!actor) ({actor} = await random.actor(account));
		if (!policy) ({policy} = await random.policy(hub, actor, account));
		return {
			actor: actor.actor_id,
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
		return random_boolean();
	},
	OpenDialog: async () => {
		return to_dialog_params(class SomeComponent extends SvelteComponent {}, {});
	},
	CloseDialog: async () => {
		return undefined;
	},
	ViewSpace: async (random, {account, actor, hub} = {}) => {
		return {
			space_id: (await random.space(actor, account, hub)).space.space_id,
			view: '<EntityExplorer />',
		};
	},
	ClearFreshness: async (random, {account, actor, hub} = {}) => {
		return {
			directory_id: (await random.space(actor, account, hub)).space.directory_id,
		};
	},
};
