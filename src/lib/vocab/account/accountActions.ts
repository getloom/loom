import type {ServiceActionData} from '$lib/vocab/action/action';

export const SignUp: ServiceActionData = {
	type: 'ServiceAction',
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
			session: {$ref: '/schemas/ClientAccountSession.json'},
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

export const UpdateAccountSettings: ServiceActionData = {
	type: 'ServiceAction',
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
		$ref: '/schemas/ClientAccount.json',
	},
	returns: 'Promise<UpdateAccountSettingsResponseResult>',
	route: {
		path: '/api/v1/account/settings',
		method: 'POST',
	},
};

export const UpdateAccountPassword: ServiceActionData = {
	type: 'ServiceAction',
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
	},
	returns: 'Promise<UpdateAccountPasswordResponseResult>',
	route: {
		path: '/api/v1/account/password',
		method: 'POST',
	},
};

export const SignIn: ServiceActionData = {
	type: 'ServiceAction',
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
			session: {$ref: '/schemas/ClientAccountSession.json'},
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

export const SignOut: ServiceActionData = {
	type: 'ServiceAction',
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
