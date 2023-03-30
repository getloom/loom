export const HubSchema = {
	$id: '/schemas/Hub.json',
	type: 'object',
	description: `
		Hubs represent the membrane around the places Actors can interact with each other or with system level data.
		They have self contained governance and ownership of Spaces within them.
		By default they are hidden & undiscoverable and are only visible to a user once a Persona has been invited in.
	`,
	properties: {
		hub_id: {type: 'number'},
		type: {type: 'string', enum: ['community', 'personal']},
		name: {type: 'string'},
		settings: {$ref: '/schemas/HubSettings.json', tsType: 'HubSettings'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['hub_id', 'type', 'name', 'settings', 'created', 'updated'],
	additionalProperties: false,
};

export const HubSettingsSchema = {
	$id: '/schemas/HubSettings.json',
	type: 'object',
	description: `
		A nested set of attributes on Hub. Holds all hub level settings.
	`,
	properties: {
		hue: {type: 'number'},
		defaultRoleId: {type: 'number'},
		instance: {
			type: 'object',
			properties: {
				allowedAccountNames: {type: 'array', items: {type: 'string'}},
				disableCreateHub: {type: 'boolean'},
			},
			additionalProperties: false,
		},
	},
	required: ['hue', 'defaultRoleId'],
	additionalProperties: false,
};

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
};
