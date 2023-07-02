import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateHub: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateHub',
	params: {
		$id: '/schemas/CreateHubParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			template: {type: 'object', tsType: 'HubTemplate'}, // TODO add template schemas and use $ref
		},
		required: ['actor', 'template'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateHubResponse',
		type: 'object',
		properties: {
			hub: {$ref: '/schemas/Hub'},
			roles: {type: 'array', items: {$ref: '/schemas/Role'}},
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
			policies: {type: 'array', items: {$ref: '/schemas/Policy'}},
			actors: {
				type: 'array',
				items: {$ref: '/schemas/PublicActor'},
			},
		},
		required: ['hub', 'roles', 'policies', 'spaces', 'directories', 'assignments', 'actors'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateHubResponseResult>',
	route: {
		path: '/api/v1/hubs',
		method: 'POST',
	},
};

export const ReadHub: ServiceActionData = {
	type: 'ServiceAction',
	name: 'ReadHub',
	params: {
		$id: '/schemas/ReadHubParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadHubResponse',
		type: 'object',
		properties: {
			hub: {$ref: '/schemas/Hub'},
			spaces: {type: 'array', items: {$ref: '/schemas/Space'}},
			directories: {
				type: 'array',
				items: {
					$ref: '/schemas/Entity',
					tsType: 'Directory',
					tsImport: "import type {Directory} from '$lib/vocab/entity/entityData';",
				},
			},
			roles: {type: 'array', items: {$ref: '/schemas/Role'}},
			assignments: {type: 'array', items: {$ref: '/schemas/Assignment'}},
			actors: {
				type: 'array',
				items: {$ref: '/schemas/PublicActor'},
			},
		},
		required: ['hub', 'spaces', 'directories', 'roles', 'assignments', 'actors'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadHubResponseResult>',
	route: {
		path: '/api/v1/hubs/:hub_id/query',
		method: 'POST',
	},
};

export const UpdateHub: ServiceActionData = {
	type: 'ServiceAction',
	name: 'UpdateHub',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateHubParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
			settings: {$ref: '/schemas/HubSettings'},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateHubResponse',
		type: 'object',
		properties: {
			hub: {$ref: '/schemas/Hub'},
		},
		required: ['hub'],
		additionalProperties: false,
	},
	returns: 'Promise<UpdateHubResponseResult>',
	route: {
		path: '/api/v1/hubs/:hub_id',
		method: 'POST',
	},
};

export const DeleteHub: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeleteHub',
	params: {
		$id: '/schemas/DeleteHubParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteHubResponse',
		type: 'null',
	},
	returns: 'Promise<DeleteHubResponseResult>',
	route: {
		path: '/api/v1/hubs/:hub_id',
		method: 'DELETE',
	},
};

export const InviteToHub: ServiceActionData = {
	type: 'ServiceAction',
	name: 'InviteToHub',
	broadcast: true,
	params: {
		$id: '/schemas/InviteToHubParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
			name: {type: 'string'},
		},
		required: ['actor', 'hub_id', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/InviteToHubResponse',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/PublicActor'},
			assignment: {$ref: '/schemas/Assignment'},
		},
		required: ['actor', 'assignment'],
		additionalProperties: false,
	},
	returns: 'Promise<InviteToHubResponseResult>',
	route: {
		path: '/api/v1/hub/invite',
		method: 'POST',
	},
};

export const LeaveHub: ServiceActionData = {
	type: 'ServiceAction',
	name: 'LeaveHub',
	broadcast: true,
	params: {
		$id: '/schemas/LeaveHubParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			actor_id: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
		},
		required: ['actor', 'actor_id', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/LeaveHubResponse',
		type: 'null',
	},
	returns: 'Promise<LeaveHubResponseResult>',
	route: {
		path: '/api/v1/hub/leave',
		method: 'POST',
	},
};

export const KickFromHub: ServiceActionData = {
	type: 'ServiceAction',
	name: 'KickFromHub',
	broadcast: true,
	params: {
		$id: '/schemas/KickFromHubParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			actor_id: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
		},
		required: ['actor', 'actor_id', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/KickFromHubResponse',
		type: 'null',
	},
	returns: 'Promise<KickFromHubResponseResult>',
	route: {
		path: '/api/v1/hub/kick',
		method: 'POST',
	},
};
