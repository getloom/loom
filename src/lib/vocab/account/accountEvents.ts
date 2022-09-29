import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const UpdateAccountSettings: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'UpdateAccountSettings',
	authorize: false,
	params: {
		$id: '/schemas/UpdateAccountSettingsParams.json',
		type: 'object',
		properties: {
			settings: {$ref: '/schemas/AccountSettings.json'},
		},
		required: ['settings'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateAccountSettingsResponse.json',
		type: 'null',
	},
	returns: 'Promise<UpdateAccountSettingsResponseResult>',
	route: {
		path: '/api/v1/account/settings',
		method: 'POST',
	},
};
