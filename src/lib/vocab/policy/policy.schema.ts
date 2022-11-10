export const PolicySchema = {
	$id: '/schemas/Policy.json',
	type: 'object',
	properties: {
		policy_id: {type: 'number'},
		role_id: {type: 'number'},
		permission: {type: 'string'},
		data: {anyOf: [{type: 'object'}, {type: 'null'}]},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['policy_id', 'role_id', 'permission', 'data', 'created', 'updated'],
	additionalProperties: false,
};
