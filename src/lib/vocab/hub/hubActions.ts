import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateHub: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateHub',
	params: {
		$id: '/schemas/CreateHubParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			template: {type: 'object', tsType: 'HubTemplate'}, // TODO add template schemas and use $ref
		},
		required: ['actor', 'template'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateHubResponse.json',
		type: 'object',
		properties: {
			hub: {$ref: '/schemas/Hub.json'},
			roles: {type: 'array', items: {$ref: '/schemas/Role.json'}},
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
			policies: {type: 'array', items: {$ref: '/schemas/Policy.json'}},
			actors: {
				type: 'array',
				items: {$ref: '/schemas/PublicActor.json'},
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
		$id: '/schemas/ReadHubParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			hub_id: {$ref: '/schemas/HubId.json'},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadHubResponse.json',
		type: 'object',
		properties: {
			hub: {$ref: '/schemas/Hub.json'},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json'}},
			directories: {
				type: 'array',
				items: {
					$ref: '/schemas/Entity.json',
					tsType: 'Directory',
					tsImport: "import type {Directory} from '$lib/vocab/entity/entityData';",
				},
			},
			roles: {type: 'array', items: {$ref: '/schemas/Role.json'}},
			assignments: {type: 'array', items: {$ref: '/schemas/Assignment.json'}},
			actors: {
				type: 'array',
				items: {$ref: '/schemas/PublicActor.json'},
			},
		},
		required: ['hub', 'spaces', 'directories', 'roles', 'assignments', 'actors'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadHubResponseResult>',
	route: {
		path: '/api/v1/hubs/:hub_id',
		method: 'GET',
	},
};

export const UpdateHubSettings: ServiceActionData = {
	type: 'ServiceAction',
	name: 'UpdateHubSettings',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateHubSettingsParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			hub_id: {$ref: '/schemas/HubId.json'},
			settings: {$ref: '/schemas/HubSettings.json'},
		},
		required: ['actor', 'hub_id', 'settings'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateHubSettingsResponse.json',
		type: 'null',
	},
	returns: 'Promise<UpdateHubSettingsResponseResult>',
	route: {
		path: '/api/v1/hubs/:hub_id/settings',
		method: 'POST',
	},
};

export const DeleteHub: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeleteHub',
	params: {
		$id: '/schemas/DeleteHubParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			hub_id: {$ref: '/schemas/HubId.json'},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteHubResponse.json',
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
		$id: '/schemas/InviteToHubParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			hub_id: {$ref: '/schemas/HubId.json'},
			name: {type: 'string'},
		},
		required: ['actor', 'hub_id', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/InviteToHubResponse.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/PublicActor.json'},
			assignment: {$ref: '/schemas/Assignment.json'},
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
		$id: '/schemas/LeaveHubParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			actor_id: {$ref: '/schemas/ActorId.json'},
			hub_id: {$ref: '/schemas/HubId.json'},
		},
		required: ['actor', 'actor_id', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/LeaveHubResponse.json',
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
		$id: '/schemas/KickFromHubParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			actor_id: {$ref: '/schemas/ActorId.json'},
			hub_id: {$ref: '/schemas/HubId.json'},
		},
		required: ['actor', 'actor_id', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/KickFromHubResponse.json',
		type: 'null',
	},
	returns: 'Promise<KickFromHubResponseResult>',
	route: {
		path: '/api/v1/hub/kick',
		method: 'POST',
	},
};
