import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateCommunity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateCommunity',
	params: {
		$id: '/schemas/CreateCommunityParams.json',
		type: 'object',
		properties: {
			name: {type: 'string'},
			persona_id: {type: 'number'},
			settings: {$ref: '/schemas/CommunitySettings.json'},
		},
		required: ['name', 'persona_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateCommunityResponse.json',
		type: 'object',
		properties: {
			community: {$ref: '/schemas/Community.json', tsType: 'Community'},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
			directories: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
			memberships: {type: 'array', items: {$ref: '/schemas/Membership.json', tsType: 'Membership'}},
			personas: {type: 'array', items: {$ref: '/schemas/Persona.json', tsType: 'Persona'}},
		},
		required: ['community', 'spaces', 'directories', 'memberships', 'personas'],
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
			community_id: {type: 'number'},
		},
		required: ['community_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadCommunityResponse.json',
		type: 'object',
		properties: {
			community: {$ref: '/schemas/Community.json', tsType: 'Community'},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
			directories: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
			memberships: {type: 'array', items: {$ref: '/schemas/Membership.json', tsType: 'Membership'}},
			personas: {type: 'array', items: {$ref: '/schemas/Persona.json', tsType: 'Persona'}},
		},
		required: ['community', 'spaces', 'directories', 'memberships', 'personas'],
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
		properties: {},
		required: [],
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
			community_id: {type: 'number'},
			settings: {$ref: '/schemas/CommunitySettings.json'},
		},
		required: ['community_id', 'settings'],
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
			community_id: {type: 'number'},
		},
		required: ['community_id'],
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
