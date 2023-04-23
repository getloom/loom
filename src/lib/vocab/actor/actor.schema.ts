export const ActorIdSchema = {
	$id: '/schemas/ActorId.json',
	type: 'number',
	tsType: "Flavored<number, 'ActorId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
};

export const ActorSchema = {
	$id: '/schemas/Actor.json',
	description: `
	 Actors perform actions in the system. They can be of type Account, Hub, or Ghost.
	`,
	anyOf: [
		{$ref: '/schemas/AccountActor.json'},
		{$ref: '/schemas/CommunityActor.json'},
		{$ref: '/schemas/GhostActor.json'},
	],
	tsType: '(AccountActor | CommunityActor | GhostActor)',
};

export const ActionActorSchema = {
	$id: '/schemas/ActionActor.json',
	anyOf: [{$ref: '/schemas/AccountActor.json'}, {$ref: '/schemas/CommunityActor.json'}],
	tsType: '(AccountActor | CommunityActor)',
};

export const AccountActorSchema = {
	$id: '/schemas/AccountActor.json',
	type: 'object',
	description: `
		Represents a human actor logged in via an Account. They are owned and managed from the account level.
		When an AccountActor is created, a personal Hub is also created for it and associated via 'hub_id'.
		A reference to this personal Hub is stored in 'hub_id'.
	`,
	properties: {
		actor_id: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
		account_id: {
			$ref: '/schemas/AccountId.json',
			tsType: 'AccountId',
			tsImport: "import type {AccountId} from '$lib/vocab/account/account'",
		},
		hub_id: {
			$ref: '/schemas/HubId.json',
			tsType: 'HubId',
			tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
		},
		type: {type: 'string', enum: ['account']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['actor_id', 'account_id', 'hub_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
};

export const CommunityActorSchema = {
	$id: '/schemas/CommunityActor.json',
	type: 'object',
	description: `
		Represents a collective actor under the ownership of a Hub. 
		Currently, these are only created when a new Hub is made and have no extended functionality within the system.
		The Hub that owns it is represented by 'hub_id'.
	`,
	properties: {
		actor_id: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
		account_id: {type: 'null'},
		hub_id: {
			$ref: '/schemas/HubId.json',
			tsType: 'HubId',
			tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
		},
		type: {type: 'string', enum: ['community']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['actor_id', 'hub_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
};

export const GhostActorSchema = {
	$id: '/schemas/GhostActor.json',
	type: 'object',
	description: `
	 A special system-level Actor that is a placeholder for deleted or otherwise unavailable Actors.	 
	`,
	properties: {
		actor_id: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
		account_id: {type: 'null'},
		hub_id: {type: 'null'},
		type: {type: 'string', enum: ['ghost']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['actor_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
};

// TODO this will need to be split into a type union to support hub "group" actors,
// and it's related to `hub_id` being overloaded for account/hub actor types.
// see: https://github.com/feltjs/felt-server/pull/545#discussion_r1013465948
export const PublicActorSchema = {
	$id: '/schemas/PublicActor.json',
	type: 'object',
	description: `
		A subset of an Actor available to all clients in a hub.
	`,
	properties: {
		actor_id: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
		type: {type: 'string', enum: ['account', 'community', 'ghost']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		// `updated` is private
	},
	required: ['actor_id', 'type', 'name', 'created'],
	additionalProperties: false,
};

export const ClientActorSchema = {
	$id: '/schemas/ClientActor.json',
	description: `
		The union of Actor subsets a user sees on their client,
		including the user's AccountActors and all other hub actors as PublicActors.
	`,
	anyOf: [{$ref: '/schemas/AccountActor.json'}, {$ref: '/schemas/PublicActor.json'}],
	tsType: '(AccountActor | PublicActor)',
};
