import type {VocabSchema} from '@feltjs/gro';

export const AccountIdSchema = {
	$id: '/schemas/AccountId.json',
	type: 'number',
	tsType: "Flavored<number, 'AccountId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
} satisfies VocabSchema;

export const AccountSchema = {
	$id: '/schemas/Account.json',
	type: 'object',
	description: `
		Represents the point of entry to the system and is responsible for managing authentication to the system. 
		It holds top level user data and is the relation through which all other data is loaded for the client.
	`,
	properties: {
		account_id: {$ref: '/schemas/AccountId.json'},
		name: {type: 'string'},
		password: {type: 'string'},
		settings: {$ref: '/schemas/AccountSettings.json'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['account_id', 'name', 'settings', 'password', 'created', 'updated'],
	additionalProperties: false,
} satisfies VocabSchema;

export const ClientAccountSchema = {
	$id: '/schemas/ClientAccount.json',
	type: 'object',
	description: `
		A client-facing subset of an Account. Excludes 'password' for security.
	`,
	properties: {
		account_id: {$ref: '/schemas/AccountId.json'},
		name: {type: 'string'},
		settings: {$ref: '/schemas/AccountSettings.json'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['account_id', 'name', 'settings', 'created', 'updated'],
	additionalProperties: false,
} satisfies VocabSchema;

export const AccountSettingsSchema = {
	$id: '/schemas/AccountSettings.json',
	type: 'object',
	description: `
		A nested set of attributes on Account & ClientAccount. Holds all account level settings.
	`,
	properties: {
		darkmode: {type: 'boolean'},
	},
	required: [],
	additionalProperties: false,
} satisfies VocabSchema;

export const ClientSessionSchema = {
	$id: '/schemas/ClientSession.json',
	description: `
		The session data loaded on each page for authenticated and unauthenticated users.
	`,
	anyOf: [{$ref: '/schemas/ClientAccountSession.json'}, {$ref: '/schemas/ClientGuestSession.json'}],
	tsType: '(ClientAccountSession | ClientGuestSession)',
} satisfies VocabSchema;

export const ClientAccountSessionSchema = {
	$id: '/schemas/ClientAccountSession.json',
	type: 'object',
	description: `
		The session data loaded on each page for authenticated users.
	`,
	properties: {
		account: {$ref: '/schemas/ClientAccount.json'},
		sessionActors: {
			type: 'array',
			items: {$ref: '/schemas/AccountActor.json'},
		},
		hubs: {
			type: 'array',
			items: {$ref: '/schemas/Hub.json'},
		},
		roles: {type: 'array', items: {$ref: '/schemas/Role.json'}},
		spaces: {type: 'array', items: {$ref: '/schemas/Space.json'}},
		directories: {
			type: 'array',
			items: {$ref: '/schemas/Entity.json'},
			tsType: 'Array<Entity & {data: EntityData}>',
			tsImport: "import type {EntityData} from '$lib/vocab/entity/entityData'",
		},
		assignments: {type: 'array', items: {$ref: '/schemas/Assignment.json'}},
		policies: {type: 'array', items: {$ref: '/schemas/Policy.json'}},
		actors: {
			type: 'array',
			items: {$ref: '/schemas/ClientActor.json'},
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
	// TODO this data is worthless to the client
	// TODO ideally this is generated from the above schema, need mapping between `/schemas/...` and `$lib/vocab/...`, could connect `tsType` and `$ref`
	tsImport: [
		"import type {AccountActor, ClientActor} from '$lib/vocab/actor/actor'",
		"import type {Hub} from '$lib/vocab/hub/hub'",
		"import type {Entity} from '$lib/vocab/entity/entity'",
		"import type {Role} from '$lib/vocab/role/role'",
		"import type {Space} from '$lib/vocab/space/space'",
		"import type {Assignment} from '$lib/vocab/assignment/assignment'",
		"import type {Policy} from '$lib/vocab/policy/policy'",
	],
} satisfies VocabSchema;

export const ClientGuestSessionSchema = {
	$id: '/schemas/ClientGuestSession.json',
	type: 'object',
	description: `
		A type of ClientSession. Loaded for un-authenticated users, it simply indicates a user is a guest to the client.
	`,
	properties: {
		guest: {enum: [true]},
	},
	required: ['guest'],
	additionalProperties: false,
} satisfies VocabSchema;
