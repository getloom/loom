import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreatePolicy: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreatePolicy',
	broadcast: true,
	params: {
		$id: '/schemas/CreatePolicyParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			role_id: {
				$ref: '/schemas/RoleId.json',
				tsType: 'RoleId',
				tsImport: "import type {RoleId} from '$lib/vocab/role/role'",
			},
			permission: {type: 'string'},
		},
		required: ['actor', 'role_id', 'permission'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreatePolicyResponse.json',
		type: 'object',
		properties: {
			policy: {$ref: '/schemas/Policy.json', tsType: 'Policy'},
		},
		required: ['policy'],
		additionalProperties: false,
	},
	returns: 'Promise<CreatePolicyResponseResult>',
	route: {
		path: '/api/v1/hub/policies',
		method: 'POST',
	},
};

export const ReadPolicies: ServiceActionData = {
	type: 'ServiceAction',
	name: 'ReadPolicies',
	params: {
		$id: '/schemas/ReadPoliciesParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			role_id: {
				$ref: '/schemas/RoleId.json',
				tsType: 'RoleId',
				tsImport: "import type {RoleId} from '$lib/vocab/role/role'",
			},
		},
		required: ['actor', 'role_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadPoliciesResponse.json',
		type: 'object',
		properties: {
			policies: {type: 'array', items: {$ref: '/schemas/Policy.json', tsType: 'Policy'}},
		},
		required: ['policies'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadPoliciesResponseResult>',
	route: {
		path: '/api/v1/hub/policies',
		method: 'GET',
	},
};

export const UpdatePolicy: ServiceActionData = {
	type: 'ServiceAction',
	name: 'UpdatePolicy',
	broadcast: true,
	params: {
		$id: '/schemas/UpdatePolicyParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			policy_id: {
				$ref: '/schemas/PolicyId.json',
				tsType: 'PolicyId',
				tsImport: "import type {PolicyId} from '$lib/vocab/policy/policy'",
			},
			data: {anyOf: [{type: 'object'}, {type: 'null'}]},
		},
		required: ['actor', 'policy_id', 'data'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdatePolicyResponse.json',
		type: 'object',
		properties: {
			policy: {$ref: '/schemas/Policy.json', tsType: 'Policy'},
		},
		required: ['policy'],
		additionalProperties: false,
	},
	returns: 'Promise<UpdatePolicyResponseResult>',
	route: {
		path: '/api/v1/hub/policies/:policy_id',
		method: 'POST',
	},
};

export const DeletePolicy: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeletePolicy',
	broadcast: true,
	params: {
		$id: '/schemas/DeletePolicyParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			policy_id: {
				$ref: '/schemas/PolicyId.json',
				tsType: 'PolicyId',
				tsImport: "import type {PolicyId} from '$lib/vocab/policy/policy'",
			},
		},
		required: ['actor', 'policy_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeletePolicyResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeletePolicyResponseResult>',
	route: {
		path: '/api/v1/hub/policies',
		method: 'DELETE',
	},
};
