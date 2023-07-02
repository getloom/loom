import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateSpace: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateSpace',
	broadcast: true,
	params: {
		$id: '/schemas/CreateSpaceParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
			name: {type: 'string'},
			path: {type: 'string'},
			icon: {type: 'string'},
			view: {type: 'string'},
		},
		required: ['actor', 'hub_id', 'name', 'path', 'icon', 'view'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateSpaceResponse',
		type: 'object',
		properties: {
			space: {$ref: '/schemas/Space'},
			directory: {
				$ref: '/schemas/Entity',
				tsType: 'Directory',
				tsImport: "import type {Directory} from '$lib/vocab/entity/entityData';",
			},
		},
		required: ['space', 'directory'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateSpaceResponseResult>',
	route: {
		path: '/api/v1/hubs/:hub_id/spaces',
		method: 'POST',
	},
};

export const ReadSpaces: ServiceActionData = {
	type: 'ServiceAction',
	name: 'ReadSpaces',
	params: {
		$id: '/schemas/ReadSpacesParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadSpacesResponse',
		type: 'object',
		properties: {
			spaces: {type: 'array', items: {$ref: '/schemas/Space'}},
			directories: {
				type: 'array',
				items: {
					$ref: '/schemas/Entity',
					tsType: 'Directory',
					tsImport: "import type {Directory} from '$lib/vocab/entity/entityData';",
				},
			},
		},
		required: ['spaces', 'directories'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadSpacesResponseResult>',
	route: {
		path: '/api/v1/hubs/:hub_id/spaces/query',
		method: 'POST',
	},
};

export const UpdateSpace: ServiceActionData = {
	type: 'ServiceAction',
	name: 'UpdateSpace',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateSpaceParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			space_id: {$ref: '/schemas/SpaceId'},
			name: {type: 'string'},
			path: {type: 'string'},
			icon: {type: 'string'},
			view: {type: 'string'},
		},
		required: ['actor', 'space_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateSpaceResponse',
		type: 'object',
		properties: {
			space: {$ref: '/schemas/Space'},
		},
		required: ['space'],
		additionalProperties: false,
	},
	returns: 'Promise<UpdateSpaceResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id',
		method: 'POST',
	},
};

export const DeleteSpace: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeleteSpace',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteSpaceParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			space_id: {$ref: '/schemas/SpaceId'},
		},
		required: ['actor', 'space_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteSpaceResponse',
		type: 'null',
	},
	returns: 'Promise<DeleteSpaceResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id',
		method: 'DELETE',
	},
};
