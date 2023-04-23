import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateAssignment: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateAssignment',
	broadcast: true,
	params: {
		$id: '/schemas/CreateAssignmentParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			actor_id: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			hub_id: {
				$ref: '/schemas/HubId.json',
				tsType: 'HubId',
				tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
			},
			role_id: {
				$ref: '/schemas/RoleId.json',
				tsType: 'RoleId',
				tsImport: "import type {RoleId} from '$lib/vocab/role/role'",
			},
		},
		required: ['actor', 'actor_id', 'hub_id', 'role_id'],
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

export const DeleteAssignment: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeleteAssignment',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteAssignmentParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			assignment_id: {
				$ref: '/schemas/AssignmentId.json',
				tsType: 'AssignmentId',
				tsImport: "import type {AssignmentId} from '$lib/vocab/assignment/assignment'",
			},
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
