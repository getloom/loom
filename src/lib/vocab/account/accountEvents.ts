import type {ServiceEventInfo} from '$lib/vocab/event/event';

export const SignUp: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'SignUp',
	authenticate: false,
	authorize: false,
	params: {
		$id: '/schemas/SignUpParams.json',
		type: 'object',
		properties: {
			username: {type: 'string'},
			password: {type: 'string'},
		},
		required: ['username', 'password'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/SignUpResponse.json',
		type: 'object',
		properties: {
			// TODO session schema type
			// session: {$ref: 'Session.json', tsType: 'Persona'},
			session: {type: 'object', tsType: 'ClientAccountSession'},
		},
		required: ['session'],
		additionalProperties: false,
	},
	returns: 'Promise<SignUpResponseResult>',
	route: {
		path: '/api/v1/signup',
		method: 'POST',
	},
};

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
