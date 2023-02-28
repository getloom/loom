import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateAssignment: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateAssignment',
	broadcast: true,
	params: {
		$id: '/schemas/CreateAssignmentParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			persona_id: {type: 'number'},
			hub_id: {type: 'number'},
			role_id: {type: 'number'},
		},
		required: ['actor', 'persona_id', 'hub_id', 'role_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/Create AssignmentResponse.json',
		type: 'object',
		properties: {
			assignment: {$ref: '/schemas/Assignment.json', tsType: 'Assignment'},
		},
		required: ['assignment'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateAssignmentResponseResult>',
	route: {
		path: '/api/v1/assignments',
		method: 'POST',
	},
};

export const DeleteAssignment: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'DeleteAssignment',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteAssignmentParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			assignment_id: {type: 'number'},
		},
		required: ['actor', 'assignment_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteAssignmentResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteAssignmentResponseResult>',
	route: {
		path: '/api/v1/assignments',
		method: 'DELETE',
	},
};
