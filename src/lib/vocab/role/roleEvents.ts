import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateRole: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateRole',
	params: {
		$id: '/schemas/CreateRoleParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			community_id: {type: 'number'},
			name: {type: 'string'},
		},
		required: ['actor', 'community_id', 'name'],
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
		path: '/api/v1/community/roles',
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
			community_id: {type: 'number'},
		},
		required: ['actor', 'community_id'],
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
		path: '/api/v1/community/roles',
		method: 'GET',
	},
};

export const UpdateRole: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'UpdateRole',
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
		path: '/api/v1/community/roles/:role_id',
		method: 'POST',
	},
};

export const DeleteRoles: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'DeleteRoles',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteRolesParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			roleIds: {type: 'array', items: {type: 'number'}},
		},
		required: ['actor', 'roleIds'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteRolesResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteRolesResponseResult>',
	route: {
		path: '/api/v1/community/roles',
		method: 'DELETE',
	},
};
