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

export const AccountSettingsSchema = {
	$id: '/schemas/AccountSettings.json',
	type: 'object',
	properties: {
		darkmode: {type: 'boolean'},
	},
	required: [],
	additionalProperties: false,
};
