import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateAccountPersona: ServiceActionData = {
	type: 'ServiceAction',
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
			personas: {
				type: 'array',
				items: {$ref: '/schemas/ClientPersona.json', tsType: 'ClientPersona'},
			},
			hubs: {type: 'array', items: {$ref: '/schemas/Hub.json', tsType: 'Hub'}},
			roles: {type: 'array', items: {$ref: '/schemas/Role.json', tsType: 'Role'}},
			policies: {type: 'array', items: {$ref: '/schemas/Policy.json', tsType: 'Policy'}},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
			directories: {
				type: 'array',
				items: {$ref: '/schemas/Entity.json', tsType: '(Directory)'},
			},
			assignments: {type: 'array', items: {$ref: '/schemas/Assignment.json', tsType: 'Assignment'}},
		},
		required: ['personas', 'hubs', 'roles', 'policies', 'spaces', 'directories', 'assignments'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateAccountPersonaResponseResult>',
	route: {
		path: '/api/v1/personas',
		method: 'POST',
	},
};

export const DeletePersona: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeletePersona',
	params: {
		$id: '/schemas/DeletePersonaParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			targetActor: {type: 'number'},
		},
		required: ['actor', 'targetActor'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeletePersonaResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeletePersonaResponseResult>',
	route: {
		path: '/api/v1/personas/:targetActor',
		method: 'DELETE',
	},
};
