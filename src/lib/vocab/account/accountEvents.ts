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
			session: {$ref: '/schemas/ClientAccountSession.json', tsType: 'ClientAccountSession'},
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
			settings: {$ref: '/schemas/AccountSettings.json', tsType: 'AccountSettings'},
		},
		required: ['settings'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateAccountSettingsResponse.json',
		$ref: '/schemas/ClientAccount.json',
		tsType: 'ClientAccount',
	},
	returns: 'Promise<UpdateAccountSettingsResponseResult>',
	route: {
		path: '/api/v1/account/settings',
		method: 'POST',
	},
};

export const UpdateAccountPassword: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'UpdateAccountPassword',
	authorize: false,
	params: {
		$id: '/schemas/UpdateAccountPasswordParams.json',
		type: 'object',
		properties: {
			oldPassword: {type: 'string'},
			newPassword: {type: 'string'},
		},
		required: ['oldPassword', 'newPassword'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateAccountPasswordResponse.json',
		$ref: '/schemas/ClientAccount.json',
		tsType: 'ClientAccount',
	},
	returns: 'Promise<UpdateAccountPasswordResponseResult>',
	route: {
		path: '/api/v1/account/password',
		method: 'POST',
	},
};

export const SignIn: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'SignIn',
	authenticate: false,
	authorize: false,
	params: {
		$id: '/schemas/SignInParams.json',
		type: 'object',
		properties: {
			username: {type: 'string'},
			password: {type: 'string'},
		},
		required: ['username', 'password'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/SignInResponse.json',
		type: 'object',
		properties: {
			session: {$ref: '/schemas/ClientAccountSession.json', tsType: 'ClientAccountSession'},
		},
		required: ['session'],
		additionalProperties: false,
	},
	returns: 'Promise<SignInResponseResult>',
	route: {
		path: '/api/v1/signin',
		method: 'POST',
	},
};

export const SignOut: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'SignOut',
	authorize: false,
	websockets: false,
	params: {
		$id: '/schemas/SignOutParams.json',
		type: 'null',
	},
	response: {
		$id: '/schemas/SignOutResponse.json',
		type: 'null',
	},
	returns: 'Promise<SignOutResponseResult>',
	route: {
		path: '/api/v1/signout',
		method: 'POST',
	},
};
