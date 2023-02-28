import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const CreatePolicy: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreatePolicy',
	broadcast: true,
	params: {
		$id: '/schemas/CreatePolicyParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			role_id: {type: 'number'},
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

export const ReadPolicies: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadPolicies',
	params: {
		$id: '/schemas/ReadPoliciesParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			role_id: {type: 'number'},
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

export const UpdatePolicy: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'UpdatePolicy',
	broadcast: true,
	params: {
		$id: '/schemas/UpdatePolicyParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			policy_id: {type: 'number'},
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

export const DeletePolicy: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'DeletePolicy',
	broadcast: true,
	params: {
		$id: '/schemas/DeletePolicyParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			policy_id: {type: 'number'},
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
