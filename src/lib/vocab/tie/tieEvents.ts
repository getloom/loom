import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateTie: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateTie',
	params: {
		$id: '/schemas/CreateTieParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			source_id: {type: 'number'},
			dest_id: {type: 'number'},
			type: {type: 'string'},
		},
		required: ['actor', 'source_id', 'dest_id', 'type'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateTieResponse.json',
		type: 'object',
		properties: {
			tie: {$ref: '/schemas/Tie.json', tsType: 'Tie'},
		},
		required: ['tie'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateTieResponseResult>',
	route: {
		path: '/api/v1/ties',
		method: 'POST',
	},
};

export const ReadTies: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadTies',
	params: {
		$id: '/schemas/ReadTiesParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			source_id: {type: 'number'},
		},
		required: ['actor', 'source_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadTiesResponse.json',
		type: 'object',
		properties: {
			ties: {type: 'array', items: {$ref: '/schemas/Tie.json', tsType: 'Tie'}},
		},
		required: ['ties'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadTiesResponseResult>',
	route: {
		path: '/api/v1/entities/source/:source_id/ties',
		method: 'GET',
	},
};

export const DeleteTie: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'DeleteTie',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteTieParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			tie_id: {type: 'number'},
		},
		required: ['actor', 'tie_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteTieResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteTieResponseResult>',
	route: {
		path: '/api/v1/ties',
		method: 'DELETE',
	},
};
