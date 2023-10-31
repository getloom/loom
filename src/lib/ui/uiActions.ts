import type {ServiceActionData, ClientActionData} from '$lib/vocab/action/action.js';

export const Ping: ServiceActionData = {
	type: 'ServiceAction',
	name: 'Ping',
	authorize: false,
	params: {
		$id: '/schemas/PingParams',
		type: 'null',
	},
	response: {
		$id: '/schemas/PingResponse',
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
		$id: '/schemas/EphemeraParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			space_id: {$ref: '/schemas/SpaceId'},
			data: {type: 'object', properties: {type: {type: 'string'}}, required: ['type']},
		},
		required: ['actor', 'space_id', 'data'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/EphemeraResponse',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			space_id: {$ref: '/schemas/SpaceId'},
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
		$id: '/schemas/SetSessionParams',
		type: 'object',
		properties: {
			session: {$ref: '/schemas/ClientSession'},
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
		$id: '/schemas/SetMobileParams',
		type: 'boolean',
	},
	returns: 'void',
};

export const OpenDialog: ClientActionData = {
	type: 'ClientAction',
	name: 'OpenDialog',
	params: {
		$id: '/schemas/OpenDialog_Params',
		type: 'object',
		tsType: 'Dialog_Params',
		tsImport: "import type {Dialog_Params} from '@fuz.dev/fuz_dialog/dialog.js'",
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
		$id: '/schemas/ViewSpaceParams',
		type: 'object',
		properties: {
			space_id: {$ref: '/schemas/SpaceId'},
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
		$id: '/schemas/ClearFreshnessParams',
		type: 'object',
		properties: {
			directory_id: {$ref: '/schemas/EntityId'},
		},
		required: ['directory_id'],
		additionalProperties: false,
	},
	returns: 'void',
};
