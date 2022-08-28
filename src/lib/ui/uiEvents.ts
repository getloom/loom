import type {ServiceEventInfo, ClientEventInfo} from '$lib/vocab/event/event';

export const Ping: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'Ping',
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

export const Ephemera: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'Ephemera',
	broadcast: true,
	params: {
		$id: '/schemas/EphemeraParams.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			space_id: {type: 'number'},
			data: {type: 'object', properties: {type: {type: 'string'}}, required: ['type']},
		},
		required: ['actor', 'space_id', 'data'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/EphemeraResponse.json',
		type: 'object',
		properties: {
			actor: {type: 'number'},
			space_id: {type: 'number'},
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

export const ToggleMainNav: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'ToggleMainNav',
	params: null,
	returns: 'void',
};

export const ToggleSecondaryNav: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'ToggleSecondaryNav',
	params: null,
	returns: 'void',
};

export const SetMobile: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'SetMobile',
	params: {
		$id: '/schemas/SetMobileParams.json',
		type: 'boolean',
	},
	returns: 'void',
};

export const OpenDialog: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'OpenDialog',
	params: {
		$id: '/schemas/OpenDialogParams.json',
		// TODO probably extend this type with the project-level dialog types
		$ref: '/schemas/DialogData.json',
	},
	returns: 'void',
};

export const CloseDialog: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'CloseDialog',
	params: null,
	returns: 'void',
};

export const ViewSpace: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'ViewSpace',
	params: {
		$id: '/schemas/ViewSpaceParams.json',
		type: 'object',
		properties: {
			space_id: {type: 'number'},
			view: {type: ['string', 'null']},
		},
		required: ['space_id', 'view'],
		additionalProperties: false,
	},
	returns: 'void',
};

export const ClearFreshness: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'ClearFreshness',
	params: {
		$id: '/schemas/ClearFreshnessParams.json',
		type: 'object',
		properties: {
			directory_id: {type: 'number'},
		},
		required: ['directory_id'],
		additionalProperties: false,
	},
	returns: 'void',
};
