import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateRole: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateRole',
	broadcast: true,
	params: {
		$id: '/schemas/CreateRoleParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			hub_id: {$ref: '/schemas/HubId.json'},
			name: {type: 'string'},
		},
		required: ['actor', 'hub_id', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateRoleResponse.json',
		type: 'object',
		properties: {
			role: {$ref: '/schemas/Role.json'},
		},
		required: ['role'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateRoleResponseResult>',
	route: {
		path: '/api/v1/hub/roles',
		method: 'POST',
	},
};

export const ReadRoles: ServiceActionData = {
	type: 'ServiceAction',
	name: 'ReadRoles',
	params: {
		$id: '/schemas/ReadRolesParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			hub_id: {$ref: '/schemas/HubId.json'},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadRolesResponse.json',
		type: 'object',
		properties: {
			roles: {type: 'array', items: {$ref: '/schemas/Role.json'}},
		},
		required: ['roles'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadRolesResponseResult>',
	route: {
		path: '/api/v1/hub/roles',
		method: 'GET',
	},
};

export const UpdateRole: ServiceActionData = {
	type: 'ServiceAction',
	name: 'UpdateRole',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateRoleParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			role_id: {$ref: '/schemas/RoleId.json'},
			name: {type: 'string'},
		},
		required: ['actor', 'role_id', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateRoleResponse.json',
		type: 'object',
		properties: {
			role: {$ref: '/schemas/Role.json'},
		},
		required: ['role'],
		additionalProperties: false,
	},
	returns: 'Promise<UpdateRoleResponseResult>',
	route: {
		path: '/api/v1/hub/roles/:role_id',
		method: 'POST',
	},
};

export const DeleteRole: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeleteRole',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteRoleParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json'},
			role_id: {$ref: '/schemas/RoleId.json'},
		},
		required: ['actor', 'role_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteRoleResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteRoleResponseResult>',
	route: {
		path: '/api/v1/hub/roles',
		method: 'DELETE',
	},
};
