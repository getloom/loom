export const PersonaSchema = {
	$id: '/schemas/Persona.json',
	description: `
	 Personas represent actors in the system. They can be of type Account, Community, or Ghost.
	`,
	anyOf: [
		{$ref: '/schemas/AccountPersona.json'},
		{$ref: '/schemas/CommunityPersona.json'},
		{$ref: '/schemas/GhostPersona.json'},
	],
	tsType: '(AccountPersona | CommunityPersona | GhostPersona)',
};

export const ActorPersonaSchema = {
	$id: '/schemas/ActorPersona.json',
	anyOf: [{$ref: '/schemas/AccountPersona.json'}, {$ref: '/schemas/CommunityPersona.json'}],
	tsType: '(AccountPersona | CommunityPersona)',
};

export const AccountPersonaSchema = {
	$id: '/schemas/AccountPersona.json',
	type: 'object',
	description: `
		Represents a human actor logged in via an Account. They are owned and managed from the account level.
		When an AccountPersona is created, a personal Community is also created for it and associated via 'community_id'.
		A reference to this personal Community is stored in 'community_id'.
	`,
	properties: {
		persona_id: {type: 'number'},
		account_id: {type: 'number'},
		community_id: {type: 'number'},
		type: {type: 'string', enum: ['account']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['persona_id', 'account_id', 'community_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
};

export const CommunityPersonaSchema = {
	$id: '/schemas/CommunityPersona.json',
	type: 'object',
	description: `
		Represents a collective actor under the ownership of a Community. 
		Currently, these are only created when a new Community is made and have no extended functionality within the system.
		The Community that owns it is represented by 'community_id'.
	`,
	properties: {
		persona_id: {type: 'number'},
		account_id: {type: 'null'},
		community_id: {type: 'number'},
		type: {type: 'string', enum: ['community']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['persona_id', 'community_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
};

export const GhostPersonaSchema = {
	$id: '/schemas/GhostPersona.json',
	type: 'object',
	description: `
	 A special system-level Persona that is a placeholder for deleted or otherwise unavailable Personas.	 
	`,
	properties: {
		persona_id: {type: 'number'},
		account_id: {type: 'null'},
		community_id: {type: 'null'},
		type: {type: 'string', enum: ['ghost']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['persona_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: false,
};

// TODO this will need to be split into a type union to support community "group" personas,
// and it's related to `community_id` being overloaded for account/community persona types.
// see: https://github.com/feltjs/felt-server/pull/545#discussion_r1013465948
export const PublicPersonaSchema = {
	$id: '/schemas/PublicPersona.json',
	type: 'object',
	description: `
		A subset of a Persona available to all clients in a community.
	`,
	properties: {
		persona_id: {type: 'number'},
		type: {type: 'string', enum: ['account', 'community', 'ghost']},
		name: {type: 'string'},
		icon: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		// `updated` is private
	},
	required: ['persona_id', 'type', 'name', 'created'],
	additionalProperties: false,
};

export const ClientPersonaSchema = {
	$id: '/schemas/ClientPersona.json',
	description: `
		The union of Persona subsets a user sees on their client,
		including the user's AccountPersonas and all other community actors as PublicPersonas.
	`,
	anyOf: [{$ref: '/schemas/AccountPersona.json'}, {$ref: '/schemas/PublicPersona.json'}],
	tsType: '(AccountPersona | PublicPersona)',
};
