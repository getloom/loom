import type {ServiceEventInfo, ClientEventInfo} from '$lib/vocab/event/event';

export const SetSession: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'SetSession',
	params: {
		$id: '/schemas/SetSessionParams.json',
		type: 'object',
		properties: {
			session: {
				type: 'object',
				// TODO it'd be nice to have schema validation here,
				// but currently the `ClientSession` is a manually-synced type.
				// This would be good for security because the server could validate the data
				// returned from `loadClientSession`.
				tsType: 'ClientSession',
			},
		},
		required: ['session'],
		additionalProperties: false,
	},
	returns: 'void',
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
			// TODO session schema type
			// session: {$ref: 'Session.json', tsType: 'Persona'},
			session: {type: 'object', tsType: 'ClientAccountSession'},
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
