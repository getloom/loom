import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateAccountActor: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateAccountActor',
	authorize: false,
	params: {
		$id: '/schemas/CreateAccountActorParams',
		type: 'object',
		properties: {
			name: {type: 'string'},
		},
		required: ['name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateAccountActorResponse',
		type: 'object',
		properties: {
			actors: {
				type: 'array',
				items: {$ref: '/schemas/ClientActor'},
			},
			hubs: {type: 'array', items: {$ref: '/schemas/Hub'}},
			roles: {type: 'array', items: {$ref: '/schemas/Role'}},
			policies: {type: 'array', items: {$ref: '/schemas/Policy'}},
			spaces: {type: 'array', items: {$ref: '/schemas/Space'}},
			directories: {
				type: 'array',
				items: {
					$ref: '/schemas/Entity',
					tsType: 'Directory',
					tsImport: "import type {Directory} from '$lib/vocab/entity/entityData';",
				},
			},
			assignments: {type: 'array', items: {$ref: '/schemas/Assignment'}},
		},
		required: ['actors', 'hubs', 'roles', 'policies', 'spaces', 'directories', 'assignments'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateAccountActorResponseResult>',
	route: {
		path: '/api/v1/actors',
		method: 'POST',
	},
};

export const DeleteActor: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeleteActor',
	params: {
		$id: '/schemas/DeleteActorParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			actor_id: {$ref: '/schemas/ActorId'},
		},
		required: ['actor', 'actor_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteActorResponse',
		type: 'null',
	},
	returns: 'Promise<DeleteActorResponseResult>',
	route: {
		path: '/api/v1/actors/:actor_id',
		method: 'DELETE',
	},
};
