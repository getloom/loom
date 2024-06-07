import type {ServiceActionData} from '$lib/vocab/action/action.js';

export const RunTask: ServiceActionData = {
	type: 'ServiceAction',
	name: 'RunTask',
	params: {
		$id: '/schemas/RunTaskParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
			task: {type: 'string'},
			args: {type: 'array', items: {type: 'string'}},
		},
		required: ['actor', 'hub_id', 'task'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/RunTaskResponse',
		type: 'object',
		properties: {
			message: {type: 'string'}
		},
		required: ['message'],
		additionalProperties: false,
	},
	returns: 'Promise<RunTaskResponseResult>',
	route: {
		path: '/api/v1/tasks',
		method: 'POST',
	},
};