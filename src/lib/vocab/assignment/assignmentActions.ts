import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateAssignment: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateAssignment',
	broadcast: true,
	params: {
		$id: '/schemas/CreateAssignmentParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			actor_id: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
			role_id: {$ref: '/schemas/RoleId'},
		},
		required: ['actor', 'actor_id', 'hub_id', 'role_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateAssignmentResponse',
		type: 'object',
		properties: {
			assignment: {$ref: '/schemas/Assignment'},
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
		$id: '/schemas/DeleteAssignmentParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			assignment_id: {$ref: '/schemas/AssignmentId'},
		},
		required: ['actor', 'assignment_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteAssignmentResponse',
		type: 'null',
	},
	returns: 'Promise<DeleteAssignmentResponseResult>',
	route: {
		path: '/api/v1/assignments',
		method: 'DELETE',
	},
};
