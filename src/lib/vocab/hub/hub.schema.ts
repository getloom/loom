import type {VocabSchema} from '@feltjs/gro';

export const HubIdSchema = {
	$id: '/schemas/HubId',
	type: 'number',
	tsType: "Flavored<number, 'HubId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
} satisfies VocabSchema;

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
} satisfies VocabSchema;

export const HubSettingsSchema = {
	$id: '/schemas/HubSettings',
	type: 'object',
	description: `
		A nested set of attributes on <Vocab name="Hub" />. Holds all hub level settings.
	`,
	properties: {
		hue: {type: 'number'},
		defaultRoleId: {$ref: '/schemas/RoleId'},
		instance: {
			type: 'object',
			properties: {
				allowedAccountNames: {type: 'array', items: {type: 'string'}},
				disableCreateHub: {type: 'boolean'},
				defaultHubIds: {type: 'array', items: {$ref: '/schemas/HubId'}},
			},
			additionalProperties: false,
		},
	},
	required: ['hue', 'defaultRoleId'],
	additionalProperties: false,
} satisfies VocabSchema;

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
} satisfies VocabSchema;
