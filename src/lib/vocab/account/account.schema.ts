import type {JsonSchema} from '@grogarden/gro/schema.js';

export const AccountIdSchema = {
	$id: '/schemas/AccountId',
	type: 'number',
	tsType: "Flavored<number, 'AccountId'>",
	tsImport: "import {Flavored} from '@grogarden/util/types.js';",
} satisfies JsonSchema;

export const AccountSchema = {
	$id: '/schemas/Account',
	type: 'object',
	description: `
		Represents the point of entry to the system and is responsible for managing authentication to the system. 
		It holds top level user data and is the relation through which all other data is loaded for the client.
	`,
	properties: {
		account_id: {$ref: '/schemas/AccountId'},
		name: {type: 'string'},
		password: {type: 'string'},
		settings: {$ref: '/schemas/AccountSettings'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['account_id', 'name', 'settings', 'password', 'created', 'updated'],
	additionalProperties: false,
} satisfies JsonSchema;

export const ClientAccountSchema = {
	$id: '/schemas/ClientAccount',
	type: 'object',
	description: `
		A client-facing subset of an <Vocab name="Account" />. Excludes <code>password</code> for security.
	`,
	properties: {
		account_id: {$ref: '/schemas/AccountId'},
		name: {type: 'string'},
		settings: {$ref: '/schemas/AccountSettings'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['account_id', 'name', 'settings', 'created', 'updated'],
	additionalProperties: false,
} satisfies JsonSchema;

export const AccountSettingsSchema = {
	$id: '/schemas/AccountSettings',
	type: 'object',
	description: `
		A nested set of attributes on <Vocab name="Account" /> and <Vocab name="ClientAccount" />. Holds all account level settings.
	`,
	properties: {
		darkmode: {type: 'boolean'},
	},
	required: [],
	additionalProperties: false,
} satisfies JsonSchema;

export const ClientSessionSchema = {
	$id: '/schemas/ClientSession',
	description: `
		The session data loaded on each page for authenticated and unauthenticated users.
	`,
	anyOf: [{$ref: '/schemas/ClientAccountSession'}, {$ref: '/schemas/ClientGuestSession'}],
} satisfies JsonSchema;

export const ClientAccountSessionSchema = {
	$id: '/schemas/ClientAccountSession',
	type: 'object',
	description: `
		The session data loaded on each page for authenticated users.
	`,
	properties: {
		account: {$ref: '/schemas/ClientAccount'},
		sessionActors: {
			type: 'array',
			items: {$ref: '/schemas/AccountActor'},
		},
		hubs: {
			type: 'array',
			items: {$ref: '/schemas/Hub'},
		},
		roles: {type: 'array', items: {$ref: '/schemas/Role'}},
		spaces: {type: 'array', items: {$ref: '/schemas/Space'}},
		directories: {
			type: 'array',
			items: {$ref: '/schemas/Entity'},
			tsType: 'Array<Entity & {data: EntityData}>',
			tsImport: "import type {EntityData} from '$lib/vocab/entity/entityData'",
		},
		assignments: {type: 'array', items: {$ref: '/schemas/Assignment'}},
		policies: {type: 'array', items: {$ref: '/schemas/Policy'}},
		actors: {
			type: 'array',
			items: {$ref: '/schemas/ClientActor'},
		},
		guest: {enum: [false]},
	},
	required: [
		'account',
		'sessionActors',
		'hubs',
		'roles',
		'spaces',
		'directories',
		'assignments',
		'policies',
		'actors',
	],
	additionalProperties: false,
} satisfies JsonSchema;

export const ClientGuestSessionSchema = {
	$id: '/schemas/ClientGuestSession',
	type: 'object',
	description: `
		A type of <Vocab name="ClientSession" />. Loaded for un-authenticated users, it simply indicates a user is a guest to the client.
	`,
	properties: {
		guest: {enum: [true]},
	},
	required: ['guest'],
	additionalProperties: false,
} satisfies JsonSchema;
