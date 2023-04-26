import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateAssignment: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateAssignment',
	broadcast: true,
	params: {
		$id: '/schemas/CreateAssignmentParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			actor_id: {$ref: '/schemas/ActorId.json'},
			hub_id: {$ref: '/schemas/HubId.json'},
			role_id: {$ref: '/schemas/RoleId.json'},
		},
		required: ['actor', 'actor_id', 'hub_id', 'role_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/Create AssignmentResponse.json',
		type: 'object',
		properties: {
			assignment: {$ref: '/schemas/Assignment.json'},
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

export const DeleteAssignment: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeleteAssignment',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteAssignmentParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			assignment_id: {$ref: '/schemas/AssignmentId.json'},
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
