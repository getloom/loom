import type {ServiceActionData, ClientActionData} from '$lib/vocab/action/action';

export const Ping: ServiceActionData = {
	type: 'ServiceAction',
	name: 'Ping',
	authorize: false,
	params: {
		$id: '/schemas/PingParams.json',
		type: 'null',
	},
	response: {
		$id: '/schemas/PingResponse.json',
		type: 'null',
	},
	returns: `Promise<ApiResult<null>>`,
	route: {
		path: '/api/v1/ping',
		method: 'GET',
	},
};

export const Ephemera: ServiceActionData = {
	type: 'ServiceAction',
	name: 'Ephemera',
	broadcast: true,
	params: {
		$id: '/schemas/EphemeraParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number', tsType: 'ActorId'},
			space_id: {
				type: 'number',
				tsType: 'SpaceId',
				tsImport: "import type {SpaceId} from '$lib/vocab/space/space'",
			},
			data: {type: 'object', properties: {type: {type: 'string'}}, required: ['type']},
		},
		required: ['actor', 'space_id', 'data'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/EphemeraResponse.json',
		type: 'object',
		properties: {
			actor: {type: 'number', tsType: 'ActorId'},
			space_id: {
				type: 'number',
				tsType: 'SpaceId',
				tsImport: "import type {SpaceId} from '$lib/vocab/space/space'",
			},
			data: {type: 'object', properties: {type: {type: 'string'}}, required: ['type']},
		},
		required: ['actor', 'space_id', 'data'],
		additionalProperties: false,
	},
	returns: `Promise<EphemeraResponseResult>`,
	route: {
		path: '/api/v1/ephemera',
		method: 'POST',
	},
};

export const SetSession: ClientActionData = {
	type: 'ClientAction',
	name: 'SetSession',
	params: {
		$id: '/schemas/SetSessionParams.json',
		type: 'object',
		properties: {
			session: {$ref: '/schemas/ClientSession.json', tsType: 'ClientSession'},
		},
		required: ['session'],
		additionalProperties: false,
	},
	returns: 'void',
};

export const ToggleMainNav: ClientActionData = {
	type: 'ClientAction',
	name: 'ToggleMainNav',
	params: null,
	returns: 'void',
};

export const ToggleSecondaryNav: ClientActionData = {
	type: 'ClientAction',
	name: 'ToggleSecondaryNav',
	params: null,
	returns: 'void',
};

export const SetMobile: ClientActionData = {
	type: 'ClientAction',
	name: 'SetMobile',
	params: {
		$id: '/schemas/SetMobileParams.json',
		type: 'boolean',
	},
	returns: 'void',
};

export const OpenDialog: ClientActionData = {
	type: 'ClientAction',
	name: 'OpenDialog',
	params: {
		$id: '/schemas/OpenDialogParams.json',
		// TODO probably extend this type with the project-level dialog types
		$ref: '/schemas/DialogData.json',
	},
	returns: 'void',
};

export const CloseDialog: ClientActionData = {
	type: 'ClientAction',
	name: 'CloseDialog',
	params: null,
	returns: 'void',
};

export const ViewSpace: ClientActionData = {
	type: 'ClientAction',
	name: 'ViewSpace',
	params: {
		$id: '/schemas/ViewSpaceParams.json',
		type: 'object',
		properties: {
			space_id: {
				type: 'number',
				tsType: 'SpaceId',
				tsImport: "import type {SpaceId} from '$lib/vocab/space/space'",
			},
			view: {type: ['string', 'null']},
		},
		required: ['space_id', 'view'],
		additionalProperties: false,
	},
	returns: 'void',
};

export const ClearFreshness: ClientActionData = {
	type: 'ClientAction',
	name: 'ClearFreshness',
	params: {
		$id: '/schemas/ClearFreshnessParams.json',
		type: 'object',
		properties: {
			directory_id: {type: 'number', tsType: 'EntityId'},
		},
		required: ['directory_id'],
		additionalProperties: false,
	},
	returns: 'void',
};
