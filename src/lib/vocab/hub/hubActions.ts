import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateHub: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateHub',
	params: {
		$id: '/schemas/CreateHubParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number', tsType: 'ActorId'},
			template: {type: 'object', tsType: 'HubTemplate'}, // TODO add template schemas and use $ref
		},
		required: ['actor', 'template'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateHubResponse.json',
		type: 'object',
		properties: {
			hub: {$ref: '/schemas/Hub.json', tsType: 'Hub'},
			roles: {type: 'array', items: {$ref: '/schemas/Role.json', tsType: 'Role'}},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
			directories: {
				type: 'array',
				items: {$ref: '/schemas/Entity.json', tsType: '(Directory)'},
			},
			assignments: {type: 'array', items: {$ref: '/schemas/Assignment.json', tsType: 'Assignment'}},
			policies: {type: 'array', items: {$ref: '/schemas/Policy.json', tsType: 'Policy'}},
			personas: {
				type: 'array',
				items: {$ref: '/schemas/PublicActor.json', tsType: 'PublicActor'},
			},
		},
		required: ['hub', 'roles', 'policies', 'spaces', 'directories', 'assignments', 'personas'],
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
			actor: {type: 'number', tsType: 'ActorId'},
			hub_id: {
				type: 'number',
				tsType: 'HubId',
				tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
			},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadHubResponse.json',
		type: 'object',
		properties: {
			hub: {$ref: '/schemas/Hub.json', tsType: 'Hub'},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
			directories: {
				type: 'array',
				items: {$ref: '/schemas/Entity.json', tsType: '(Directory)'},
			},
			roles: {type: 'array', items: {$ref: '/schemas/Role.json', tsType: 'Role'}},
			assignments: {type: 'array', items: {$ref: '/schemas/Assignment.json', tsType: 'Assignment'}},
			personas: {
				type: 'array',
				items: {$ref: '/schemas/PublicActor.json', tsType: 'PublicActor'},
			},
		},
		required: ['hub', 'spaces', 'directories', 'roles', 'assignments', 'personas'],
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
			actor: {type: 'number', tsType: 'ActorId'},
			hub_id: {
				type: 'number',
				tsType: 'HubId',
				tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
			},
			settings: {$ref: '/schemas/HubSettings.json', tsType: 'HubSettings'},
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
			actor: {type: 'number', tsType: 'ActorId'},
			hub_id: {
				type: 'number',
				tsType: 'HubId',
				tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
			},
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
			actor: {type: 'number', tsType: 'ActorId'},
			hub_id: {
				type: 'number',
				tsType: 'HubId',
				tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
			},
			name: {type: 'string'},
		},
		required: ['actor', 'hub_id', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/InviteToHubResponse.json',
		type: 'object',
		properties: {
			persona: {$ref: '/schemas/PublicActor.json', tsType: 'PublicActor'},
			assignment: {$ref: '/schemas/Assignment.json', tsType: 'Assignment'},
		},
		required: ['persona', 'assignment'],
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
			actor: {type: 'number', tsType: 'ActorId'},
			targetActor: {
				type: 'number',
				tsType: 'ActorId',
				tsImport: "import type {ActorId} from '$lib/vocab/actor/actor'",
			},
			hub_id: {
				type: 'number',
				tsType: 'HubId',
				tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
			},
		},
		required: ['actor', 'targetActor', 'hub_id'],
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
			actor: {type: 'number', tsType: 'ActorId'},
			targetActor: {type: 'number', tsType: 'ActorId'},
			hub_id: {
				type: 'number',
				tsType: 'HubId',
				tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
			},
		},
		required: ['actor', 'targetActor', 'hub_id'],
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
