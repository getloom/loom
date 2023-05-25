import type {VocabSchema} from '@feltjs/gro';

export const HubIdSchema = {
	$id: '/schemas/HubId.json',
	type: 'number',
	tsType: "Flavored<number, 'HubId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
} satisfies VocabSchema;

export const HubSchema = {
	$id: '/schemas/Hub.json',
	type: 'object',
	description: `
		Hubs represent the membrane around the places Actors can interact with each other or with system level data.
		They have self contained governance and ownership of Spaces within them.
		By default they are hidden & undiscoverable and are only visible to a user once an Actor has been invited in.
	`,
	properties: {
		hub_id: {$ref: '/schemas/HubId.json'},
		type: {type: 'string', enum: ['community', 'personal']},
		name: {type: 'string'},
		settings: {$ref: '/schemas/HubSettings.json'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['hub_id', 'type', 'name', 'settings', 'created', 'updated'],
	additionalProperties: false,
} satisfies VocabSchema;

export const HubSettingsSchema = {
	$id: '/schemas/HubSettings.json',
	type: 'object',
	description: `
		A nested set of attributes on Hub. Holds all hub level settings.
	`,
	properties: {
		hue: {type: 'number'},
		defaultRoleId: {
			$ref: '/schemas/RoleId.json',
			tsType: 'RoleId',
			tsImport: "import type {RoleId} from '$lib/vocab/role/role'",
		},
		instance: {
			type: 'object',
			properties: {
				allowedAccountNames: {type: 'array', items: {type: 'string'}},
				disableCreateHub: {type: 'boolean'},
				defaultHubIds: {type: 'array', items: {$ref: '/schemas/HubId.json'}},
			},
			additionalProperties: false,
		},
	},
	required: ['hue', 'defaultRoleId'],
	additionalProperties: false,
} satisfies VocabSchema;

export const InitialHubSettingsSchema = {
	$id: '/schemas/InitialHubSettings.json',
	type: 'object',
	description: `
		A subset of HubSettings needed for defaults at the time of Hub creation.
	`,
	properties: {
		hue: {type: 'number'},
	},
	required: ['hue'],
	additionalProperties: false,
} satisfies VocabSchema;
