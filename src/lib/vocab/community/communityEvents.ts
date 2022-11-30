import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateCommunity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateCommunity',
	params: {
		$id: '/schemas/CreateCommunityParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			name: {type: 'string'},
			settings: {$ref: '/schemas/InitialCommunitySettingsSchema.json'},
		},
		required: ['actor', 'name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateCommunityResponse.json',
		type: 'object',
		properties: {
			community: {$ref: '/schemas/Community.json', tsType: 'Community'},
			role: {$ref: '/schemas/Role.json', tsType: 'Role'},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
			directories: {
				type: 'array',
				items: {$ref: '/schemas/Entity.json', tsType: '(Entity & {data: DirectoryEntityData})'},
			},
			assignments: {type: 'array', items: {$ref: '/schemas/Assignment.json', tsType: 'Assignment'}},
			personas: {
				type: 'array',
				items: {$ref: '/schemas/PublicPersona.json', tsType: 'PublicPersona'},
			},
		},
		required: ['community', 'role', 'spaces', 'directories', 'assignments', 'personas'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateCommunityResponseResult>',
	route: {
		path: '/api/v1/communities',
		method: 'POST',
	},
};

export const ReadCommunity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadCommunity',
	params: {
		$id: '/schemas/ReadCommunityParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			community_id: {type: 'number'},
		},
		required: ['actor', 'community_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadCommunityResponse.json',
		type: 'object',
		properties: {
			community: {$ref: '/schemas/Community.json', tsType: 'Community'},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
			directories: {
				type: 'array',
				items: {$ref: '/schemas/Entity.json', tsType: '(Entity & {data: DirectoryEntityData})'},
			},
			roles: {type: 'array', items: {$ref: '/schemas/Role.json', tsType: 'Role'}},
			assignments: {type: 'array', items: {$ref: '/schemas/Assignment.json', tsType: 'Assignment'}},
			personas: {
				type: 'array',
				items: {$ref: '/schemas/PublicPersona.json', tsType: 'PublicPersona'},
			},
		},
		required: ['community', 'spaces', 'directories', 'roles', 'assignments', 'personas'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadCommunityResponseResult>',
	route: {
		path: '/api/v1/communities/:community_id',
		method: 'GET',
	},
};

export const ReadCommunities: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadCommunities',
	params: {
		$id: '/schemas/ReadCommunitiesParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
		},
		required: ['actor'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadCommunitiesResponse.json',
		type: 'object',
		properties: {
			communities: {type: 'array', items: {$ref: '/schemas/Community.json', tsType: 'Community'}},
		},
		required: ['communities'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadCommunitiesResponseResult>',
	route: {
		path: '/api/v1/communities',
		method: 'GET',
	},
};

export const UpdateCommunitySettings: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'UpdateCommunitySettings',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateCommunitySettingsParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			community_id: {type: 'number'},
			settings: {$ref: '/schemas/CommunitySettings.json'},
		},
		required: ['actor', 'community_id', 'settings'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateCommunitySettingsResponse.json',
		type: 'null',
	},
	returns: 'Promise<UpdateCommunitySettingsResponseResult>',
	route: {
		path: '/api/v1/communities/:community_id/settings',
		method: 'POST',
	},
};

export const DeleteCommunity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'DeleteCommunity',
	params: {
		$id: '/schemas/DeleteCommunityParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			community_id: {type: 'number'},
		},
		required: ['actor', 'community_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteCommunityResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteCommunityResponseResult>',
	route: {
		path: '/api/v1/communities/:community_id',
		method: 'DELETE',
	},
};

export const InviteToCommunity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'InviteToCommunity',
	broadcast: true,
	params: {
		$id: '/schemas/InviteToCommunityParams.json',
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
		$id: '/schemas/InviteToCommunityResponse.json',
		type: 'object',
		properties: {
			persona: {$ref: '/schemas/PublicPersona.json', tsType: 'PublicPersona'},
			assignment: {$ref: '/schemas/Assignment.json', tsType: 'Assignment'},
		},
		required: ['persona', 'assignment'],
		additionalProperties: false,
	},
	returns: 'Promise<InviteToCommunityResponseResult>',
	route: {
		path: '/api/v1/community/invite',
		method: 'POST',
	},
};

export const LeaveCommunity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'LeaveCommunity',
	broadcast: true,
	params: {
		$id: '/schemas/LeaveCommunityParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			persona_id: {type: 'number'},
			community_id: {type: 'number'},
		},
		required: ['actor', 'persona_id', 'community_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/LeaveCommunityResponse.json',
		type: 'null',
	},
	returns: 'Promise<LeaveCommunityResponseResult>',
	route: {
		path: '/api/v1/community/leave',
		method: 'POST',
	},
};
