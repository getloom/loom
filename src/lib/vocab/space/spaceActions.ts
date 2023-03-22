import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateSpace: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateSpace',
	broadcast: true,
	params: {
		$id: '/schemas/CreateSpaceParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			hub_id: {type: 'number'},
			name: {type: 'string'},
			path: {type: 'string'},
			icon: {type: 'string'},
			view: {type: 'string'},
		},
		required: ['actor', 'hub_id', 'name', 'path', 'icon', 'view'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateSpaceResponse.json',
		type: 'object',
		properties: {
			space: {$ref: '/schemas/Space.json', tsType: 'Space'},
			directory: {$ref: '/schemas/Entity.json', tsType: 'Directory'},
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
		$id: '/schemas/ReadSpacesParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			hub_id: {type: 'number'},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadSpacesResponse.json',
		type: 'object',
		properties: {
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
			directories: {
				type: 'array',
				items: {$ref: '/schemas/Entity.json', tsType: '(Directory)'},
			},
		},
		required: ['spaces', 'directories'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadSpacesResponseResult>',
	route: {
		path: '/api/v1/hubs/:hub_id/spaces',
		method: 'GET',
	},
};

export const UpdateSpace: ServiceActionData = {
	type: 'ServiceAction',
	name: 'UpdateSpace',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateSpaceParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			space_id: {type: 'number'},
			name: {type: 'string'},
			path: {type: 'string'},
			icon: {type: 'string'},
			view: {type: 'string'},
		},
		required: ['actor', 'space_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateSpaceResponse.json',
		type: 'object',
		properties: {
			space: {$ref: '/schemas/Space.json', tsType: 'Space'},
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
		$id: '/schemas/DeleteSpaceParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			space_id: {type: 'number'},
		},
		required: ['actor', 'space_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteSpaceResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteSpaceResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id',
		method: 'DELETE',
	},
};
