import type {Json_Schema} from '@grogarden/gro/schema.js';

export const ActorIdSchema = {
	$id: '/schemas/ActorId',
	type: 'number',
	tsType: "Flavored<number, 'ActorId'>",
	tsImport: "import {Flavored} from '@ryanatkn/belt/types.js'",
} satisfies Json_Schema;

export const ActorRecordSchema = {
	$id: '/schemas/ActorRecord',
	type: 'object',
	description: `
		The full database record for the various <Vocab name="Actor" /> types.
	`,
	properties: {
		actor_id: {$ref: '/schemas/ActorId'},
		account_id: {$ref: '/schemas/AccountId'},
		hub_id: {$ref: '/schemas/HubId'},
		type: {type: 'string', enum: ['account', 'community', 'ghost']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['actor_id', 'account_id', 'hub_id', 'type', 'name', 'icon', 'created', 'updated'],
	additionalProperties: false,
} satisfies Json_Schema;

export const ActorSchema = {
	$id: '/schemas/Actor',
	description: `
		<Vocab name="Actor" />s perform actions in the system.
		They can be of type <code>'account'</code>, <code>'hub'</code>, or <code>'ghost'</code>.
	`,
	anyOf: [
		{$ref: '/schemas/AccountActor'},
		{$ref: '/schemas/HubActor'},
		{$ref: '/schemas/GhostActor'},
	],
} satisfies Json_Schema;

export const ActionActorSchema = {
	$id: '/schemas/ActionActor',
	anyOf: [{$ref: '/schemas/AccountActor'}, {$ref: '/schemas/HubActor'}],
} satisfies Json_Schema;

export const AccountActorSchema = {
	$id: '/schemas/AccountActor',
	type: 'object',
	description: `
		Represents a human actor logged in via an <Vocab name="Account" />. They are owned and managed from the account level.
		When an AccountActor is created, a personal <Vocab name="Hub" /> is also created for it and associated via <code>hub_id</code>.
		A reference to this personal <Vocab name="Hub" /> is stored in <code>hub_id</code>.
	`,
	properties: {
		actor_id: {$ref: '/schemas/ActorId'},
		account_id: {$ref: '/schemas/AccountId'},
		hub_id: {$ref: '/schemas/HubId'},
		type: {type: 'string', enum: ['account']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['actor_id', 'account_id', 'hub_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
} satisfies Json_Schema;

export const HubActorSchema = {
	$id: '/schemas/HubActor',
	type: 'object',
	description: `
		Represents a collective actor under the ownership of a <Vocab name="Hub" />. 
		Currently, these are only created when a new <Vocab name="Hub" /> is made and have no extended functionality within the system.
		The <Vocab name="Hub" /> that owns it is represented by <code>hub_id</code>.
	`,
	properties: {
		actor_id: {$ref: '/schemas/ActorId'},
		account_id: {type: 'null'},
		hub_id: {$ref: '/schemas/HubId'},
		type: {type: 'string', enum: ['community']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['actor_id', 'hub_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
} satisfies Json_Schema;

export const GhostActorSchema = {
	$id: '/schemas/GhostActor',
	type: 'object',
	description: `
	 A special system-level <Vocab name="Actor" /> that is a placeholder for deleted or otherwise unavailable <Vocab name="Actor" />s.	 
	`,
	properties: {
		actor_id: {$ref: '/schemas/ActorId'},
		account_id: {type: 'null'},
		hub_id: {type: 'null'},
		type: {type: 'string', enum: ['ghost']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['actor_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
} satisfies Json_Schema;

// TODO this will need to be split into a type union to support hub "group" actors,
// and it's related to `hub_id` being overloaded for account/hub actor types.
// see: https://github.com/getloom/felt/pull/545#discussion_r1013465948
export const PublicActorSchema = {
	$id: '/schemas/PublicActor',
	type: 'object',
	description: `
		A subset of an <Vocab name="Actor" /> available to all clients in a <Vocab name="Hub" />.
	`,
	properties: {
		actor_id: {$ref: '/schemas/ActorId'},
		type: {type: 'string', enum: ['account', 'community', 'ghost']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date'},
		// `updated` is private
	},
	required: ['actor_id', 'type', 'name', 'created'],
	additionalProperties: false,
} satisfies Json_Schema;

export const ClientActorSchema = {
	$id: '/schemas/ClientActor',
	description: `
		The union of <Vocab name="Actor" /> subsets a user sees on their client,
		including the user's <Vocab name="AccountActors" /> and all other hub actors as <Vocab name="PublicActors" />.
	`,
	anyOf: [{$ref: '/schemas/AccountActor'}, {$ref: '/schemas/PublicActor'}],
} satisfies Json_Schema;
