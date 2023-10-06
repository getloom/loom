import type {ServiceActionData} from '$lib/vocab/action/action.js';

export const SignUp: ServiceActionData = {
	type: 'ServiceAction',
	name: 'SignUp',
	authenticate: false,
	authorize: false,
	params: {
		$id: '/schemas/SignUpParams',
		type: 'object',
		properties: {
			username: {type: 'string'},
			password: {type: 'string'},
		},
		required: ['username', 'password'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/SignUpResponse',
		type: 'object',
		properties: {
			session: {$ref: '/schemas/ClientAccountSession'},
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
		$id: '/schemas/UpdateAccountSettingsParams',
		type: 'object',
		properties: {
			settings: {$ref: '/schemas/AccountSettings'},
		},
		required: ['settings'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateAccountSettingsResponse',
		$ref: '/schemas/ClientAccount',
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
		$id: '/schemas/UpdateAccountPasswordParams',
		type: 'object',
		properties: {
			oldPassword: {type: 'string'},
			newPassword: {type: 'string'},
		},
		required: ['oldPassword', 'newPassword'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateAccountPasswordResponse',
		$ref: '/schemas/ClientAccount',
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
		$id: '/schemas/SignInParams',
		type: 'object',
		properties: {
			username: {type: 'string'},
			password: {type: 'string'},
		},
		required: ['username', 'password'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/SignInResponse',
		type: 'object',
		properties: {
			session: {$ref: '/schemas/ClientAccountSession'},
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
		$id: '/schemas/SignOutParams',
		type: 'null',
	},
	response: {
		$id: '/schemas/SignOutResponse',
		type: 'null',
	},
	returns: 'Promise<SignOutResponseResult>',
	route: {
		path: '/api/v1/signout',
		method: 'POST',
	},
};
