import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateAccountPersona: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateAccountPersona',
	authorize: false,
	params: {
		$id: '/schemas/CreateAccountPersonaParams.json',
		type: 'object',
		properties: {
			name: {type: 'string'},
		},
		required: ['name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateAccountPersonaResponse.json',
		type: 'object',
		properties: {
			persona: {$ref: '/schemas/AccountPersona.json', tsType: 'AccountPersona'},
			community: {$ref: '/schemas/Community.json', tsType: 'Community'},
			role: {$ref: '/schemas/Role.json', tsType: 'Role'},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
			directories: {
				type: 'array',
				items: {$ref: '/schemas/Entity.json', tsType: '(Entity & {data: DirectoryEntityData})'},
			},
			assignment: {$ref: '/schemas/Assignment.json', tsType: 'Assignment'},
		},
		required: ['persona', 'community', 'role', 'spaces', 'directories', 'assignment'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateAccountPersonaResponseResult>',
	route: {
		path: '/api/v1/personas',
		method: 'POST',
	},
};

export const ReadPersona: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadPersona',
	params: {
		$id: '/schemas/ReadPersonaParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			persona_id: {type: 'number'},
		},
		required: ['actor', 'persona_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadPersonaResponse.json',
		type: 'object',
		properties: {
			persona: {$ref: '/schemas/Persona.json', tsType: 'Persona'},
		},
		required: ['persona'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadPersonaResponseResult>',
	route: {
		path: '/api/v1/personas/:persona_id',
		method: 'GET',
	},
};
