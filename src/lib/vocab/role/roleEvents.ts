import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateRole: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateRole',
	broadcast: true,
	params: {
		$id: '/schemas/CreateRoleParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			hub_id: {type: 'number'},
			name: {type: 'string'},
		},
		required: ['actor', 'hub_id', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateRoleResponse.json',
		type: 'object',
		properties: {
			role: {$ref: '/schemas/Role.json', tsType: 'Role'},
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

export const ReadRoles: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadRoles',
	params: {
		$id: '/schemas/ReadRolesParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			hub_id: {type: 'number'},
		},
		required: ['actor', 'hub_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadRolesResponse.json',
		type: 'object',
		properties: {
			roles: {type: 'array', items: {$ref: '/schemas/Role.json', tsType: 'Role'}},
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

export const UpdateRole: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'UpdateRole',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateRoleParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			role_id: {type: 'number'},
			name: {type: 'string'},
		},
		required: ['actor', 'role_id', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateRoleResponse.json',
		type: 'object',
		properties: {
			role: {$ref: '/schemas/Role.json', tsType: 'Role'},
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

export const DeleteRole: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'DeleteRole',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteRoleParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			role_id: {type: 'number'},
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
