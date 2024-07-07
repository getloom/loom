import type {Json_Schema} from '$lib/util/schema.js';

export const HubIdSchema = {
	$id: '/schemas/HubId',
	type: 'number',
	tsType: "Flavored<number, 'HubId'>",
	tsImport: "import {Flavored} from '@ryanatkn/belt/types.js'",
} satisfies Json_Schema;

export const HubSchema = {
	$id: '/schemas/Hub',
	type: 'object',
	description: `
		<Vocab name="Hub" />s represent the membrane around the places <Vocab name="Actor" />s can interact with each other or with system level data.
		They have self contained governance and ownership of <Vocab name="Space" />s within them.
		By default they are hidden and undiscoverable and are only visible to a user once an <Vocab name="Actor" /> has been invited in.
	`,
	properties: {
		hub_id: {$ref: '/schemas/HubId'},
		type: {type: 'string', enum: ['community', 'personal']},
		name: {type: 'string'},
		settings: {$ref: '/schemas/HubSettings'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['hub_id', 'type', 'name', 'settings', 'created', 'updated'],
	additionalProperties: false,
} satisfies Json_Schema;

export const HubSettingsSchema = {
	$id: '/schemas/HubSettings',
	type: 'object',
	description: `
		A nested set of attributes on <Vocab name="Hub" />. Holds all hub level settings.
	`,
	properties: {
		hue: {type: 'number'},
		defaultRoleId: {$ref: '/schemas/RoleId'},
		instance: {$ref: '/schemas/InstanceSettings'},
	},
	required: ['hue', 'defaultRoleId'],
	additionalProperties: false,
} satisfies Json_Schema;

export const InstanceSettingsSchema = {
	$id: '/schemas/InstanceSettings',
	type: 'object',
	description: `
	The instance admin specific settings.
	`,
	properties: {
		allowedAccountNames: {type: 'array', items: {type: 'string'}},
		disableCreateHub: {type: 'boolean'},
		defaultHubIds: {type: 'array', items: {$ref: '/schemas/HubId'}},
		minPasswordLength: {type: 'number'},
		site: {
			type: 'object',
			properties: {
				sourceRepo: {type: 'string'},
			},
			additionalProperties: false,
		},
	},
	additionalProperties: false,
} satisfies Json_Schema;

export const InitialHubSettingsSchema = {
	$id: '/schemas/InitialHubSettings',
	type: 'object',
	description: `
		A subset of <Vocab name="HubSettings" /> needed for defaults at the time of <Vocab name="Hub" /> creation.
	`,
	properties: {
		hue: {type: 'number'},
	},
	required: ['hue'],
	additionalProperties: false,
} satisfies Json_Schema;
