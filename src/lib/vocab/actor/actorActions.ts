import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateAccountActor: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateAccountActor',
	authorize: false,
	params: {
		$id: '/schemas/CreateAccountActorParams.json',
		type: 'object',
		properties: {
			name: {type: 'string'},
		},
		required: ['name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateAccountActorResponse.json',
		type: 'object',
		properties: {
			actors: {
				type: 'array',
				items: {$ref: '/schemas/ClientActor.json'},
			},
			hubs: {type: 'array', items: {$ref: '/schemas/Hub.json'}},
			roles: {type: 'array', items: {$ref: '/schemas/Role.json'}},
			policies: {type: 'array', items: {$ref: '/schemas/Policy.json'}},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json'}},
			directories: {
				type: 'array',
				items: {
					$ref: '/schemas/Entity.json',
					tsType: 'Directory',
					tsImport: "import type {Directory} from '$lib/vocab/entity/entityData';",
				},
			},
			assignments: {type: 'array', items: {$ref: '/schemas/Assignment.json'}},
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
		$id: '/schemas/DeleteActorParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			actor_id: {$ref: '/schemas/ActorId.json'},
		},
		required: ['actor', 'actor_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteActorResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteActorResponseResult>',
	route: {
		path: '/api/v1/actors/:actor_id',
		method: 'DELETE',
	},
};
