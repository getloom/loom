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
			memberships: {type: 'array', items: {$ref: '/schemas/Membership.json', tsType: 'Membership'}},
			personas: {type: 'array', items: {$ref: '/schemas/Persona.json', tsType: 'Persona'}},
		},
		required: ['community', 'role', 'spaces', 'directories', 'memberships', 'personas'],
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
			memberships: {type: 'array', items: {$ref: '/schemas/Membership.json', tsType: 'Membership'}},
			personas: {type: 'array', items: {$ref: '/schemas/Persona.json', tsType: 'Persona'}},
		},
		required: ['community', 'spaces', 'directories', 'roles', 'memberships', 'personas'],
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

export const LeaveCommunity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'LeaveCommunity',
	broadcast: true,
	params: {
		$id: '/schemas/LeaveCommunityParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			community_id: {type: 'number'},
		},
		required: ['actor', 'community_id'],
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
