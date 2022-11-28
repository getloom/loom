export const AccountSchema = {
	$id: '/schemas/Account.json',
	type: 'object',
	properties: {
		account_id: {type: 'number'},
		name: {type: 'string'},
		password: {type: 'string'},
		settings: {$ref: '/schemas/AccountSettings.json'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['account_id', 'name', 'settings', 'password', 'created', 'updated'],
	additionalProperties: false,
};

export const ClientAccountSchema = {
	$id: '/schemas/ClientAccount.json',
	type: 'object',
	properties: {
		account_id: {type: 'number'},
		name: {type: 'string'},
		settings: {$ref: '/schemas/AccountSettings.json'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['account_id', 'name', 'settings', 'created', 'updated'],
	additionalProperties: false,
};

export const AccountSettingsSchema = {
	$id: '/schemas/AccountSettings.json',
	type: 'object',
	properties: {
		darkmode: {type: 'boolean'},
	},
	required: [],
	additionalProperties: false,
};

export const ClientSessionSchema = {
	$id: '/schemas/ClientSession.json',
	anyOf: [{$ref: '/schemas/ClientAccountSession.json'}, {$ref: '/schemas/ClientGuestSession.json'}],
	tsType: '(ClientAccountSession | ClientGuestSession)',
};

export const ClientAccountSessionSchema = {
	$id: '/schemas/ClientAccountSession.json',
	type: 'object',
	properties: {
		account: {$ref: '/schemas/ClientAccount.json', tsType: 'ClientAccount'},
		sessionPersonas: {
			type: 'array',
			items: {$ref: '/schemas/AccountPersona.json', tsType: 'AccountPersona'},
		},
		communities: {
			type: 'array',
			items: {
				$ref: '/schemas/Community.json',
				tsType: 'Community',
			},
		},
		roles: {type: 'array', items: {$ref: '/schemas/Role.json', tsType: 'Role'}},
		spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
		directories: {
			type: 'array',
			items: {$ref: '/schemas/Entity.json'},
			tsType: 'Array<Entity & {data: EntityData}>',
		},
		assignments: {type: 'array', items: {$ref: '/schemas/Assignment.json', tsType: 'Assignment'}},
		policies: {type: 'array', items: {$ref: '/schemas/Policy.json', tsType: 'Policy'}},
		personas: {
			type: 'array',
			items: {$ref: '/schemas/ClientPersona.json', tsType: 'ClientPersona'},
		},
		guest: {enum: [false]},
	},
	required: [
		'account',
		'sessionPersonas',
		'communities',
		'roles',
		'spaces',
		'directories',
		'assignments',
		'policies',
		'personas',
	],
	additionalProperties: false,
	// TODO this data is worthless to the client
	// TODO ideally this is generated from the above schema, need mapping between `/schemas/...` and `$lib/vocab/...`, could connect `tsType` and `$ref`
	tsImport: [
		"import type {AccountPersona, ClientPersona} from '$lib/vocab/persona/persona'",
		"import type {Community} from '$lib/vocab/community/community'",
		"import type {Entity} from '$lib/vocab/entity/entity'",
		"import type {Role} from '$lib/vocab/role/role'",
		"import type {Space} from '$lib/vocab/space/space'",
		"import type {Assignment} from '$lib/vocab/assignment/assignment'",
		"import type {Policy} from '$lib/vocab/policy/policy'",
	],
};

export const ClientGuestSessionSchema = {
	$id: '/schemas/ClientGuestSession.json',
	type: 'object',
	properties: {
		guest: {enum: [true]},
	},
	required: ['guest'],
	additionalProperties: false,
};
