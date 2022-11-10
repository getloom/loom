export const PersonaSchema = {
	$id: '/schemas/Persona.json',
	anyOf: [
		{$ref: '/schemas/AccountPersona.json'},
		{$ref: '/schemas/CommunityPersona.json'},
		{$ref: '/schemas/GhostPersona.json'},
	],
	tsType: 'AccountPersona | CommunityPersona | GhostPersona',
};

export const AccountPersonaSchema = {
	$id: '/schemas/AccountPersona.json',
	type: 'object',
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
