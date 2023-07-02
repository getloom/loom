import type {ServiceActionData} from '$lib/vocab/action/action';

export const CreateRole: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateRole',
	broadcast: true,
	params: {
		$id: '/schemas/CreateRoleParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
			name: {type: 'string'},
		},
		required: ['actor', 'hub_id', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateRoleResponse',
		type: 'object',
		properties: {
			role: {$ref: '/schemas/Role'},
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
		$id: '/schemas/ReadRolesParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			hub_id: {$ref: '/schemas/HubId'},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadRolesResponse',
		type: 'object',
		properties: {
			roles: {type: 'array', items: {$ref: '/schemas/Role'}},
		},
		required: ['roles'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadRolesResponseResult>',
	route: {
		path: '/api/v1/hub/roles/query',
		method: 'POST',
	},
};

export const UpdateRole: ServiceActionData = {
	type: 'ServiceAction',
	name: 'UpdateRole',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateRoleParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			role_id: {$ref: '/schemas/RoleId'},
			name: {type: 'string'},
		},
		required: ['actor', 'role_id', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateRoleResponse',
		type: 'object',
		properties: {
			role: {$ref: '/schemas/Role'},
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
		$id: '/schemas/DeleteRoleParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			role_id: {$ref: '/schemas/RoleId'},
		},
		required: ['actor', 'role_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteRoleResponse',
		type: 'null',
	},
	returns: 'Promise<DeleteRoleResponseResult>',
	route: {
		path: '/api/v1/hub/roles',
		method: 'DELETE',
	},
};
