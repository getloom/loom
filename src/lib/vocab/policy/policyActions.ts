import type {ServiceActionData} from '$lib/vocab/action/action.js';

export const CreatePolicy: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreatePolicy',
	broadcast: true,
	params: {
		$id: '/schemas/CreatePolicyParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			role_id: {$ref: '/schemas/RoleId'},
			name: {$ref: '/schemas/PolicyName'},
		},
		required: ['actor', 'role_id', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreatePolicyResponse',
		type: 'object',
		properties: {
			policy: {$ref: '/schemas/Policy'},
		},
		required: ['policy'],
		additionalProperties: false,
	},
	returns: 'Promise<CreatePolicyResponseResult>',
	route: {
		path: '/api/v1/policies',
		method: 'POST',
	},
};

export const ReadPolicies: ServiceActionData = {
	type: 'ServiceAction',
	name: 'ReadPolicies',
	params: {
		$id: '/schemas/ReadPoliciesParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			role_id: {$ref: '/schemas/RoleId'},
		},
		required: ['actor', 'role_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadPoliciesResponse',
		type: 'object',
		properties: {
			policies: {type: 'array', items: {$ref: '/schemas/Policy'}},
		},
		required: ['policies'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadPoliciesResponseResult>',
	route: {
		path: '/api/v1/policies/query',
		method: 'POST',
	},
};

export const UpdatePolicy: ServiceActionData = {
	type: 'ServiceAction',
	name: 'UpdatePolicy',
	broadcast: true,
	params: {
		$id: '/schemas/UpdatePolicyParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			policy_id: {$ref: '/schemas/PolicyId'},
			data: {anyOf: [{type: 'object'}, {type: 'null'}]},
		},
		required: ['actor', 'policy_id', 'data'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdatePolicyResponse',
		type: 'object',
		properties: {
			policy: {$ref: '/schemas/Policy'},
		},
		required: ['policy'],
		additionalProperties: false,
	},
	returns: 'Promise<UpdatePolicyResponseResult>',
	route: {
		path: '/api/v1/policies/:policy_id',
		method: 'POST',
	},
};

export const DeletePolicy: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeletePolicy',
	broadcast: true,
	params: {
		$id: '/schemas/DeletePolicyParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			policy_id: {$ref: '/schemas/PolicyId'},
		},
		required: ['actor', 'policy_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeletePolicyResponse',
		type: 'null',
	},
	returns: 'Promise<DeletePolicyResponseResult>',
	route: {
		path: '/api/v1/policies/:policy_id',
		method: 'DELETE',
	},
};
