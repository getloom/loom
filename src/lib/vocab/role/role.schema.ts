export const RoleSchema = {
	$id: '/schemas/Role.json',
	type: 'object',
	properties: {
		role_id: {type: 'number'},
		community_id: {type: 'number'},
		name: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['role_id', 'community_id', 'name', 'created', 'updated'],
	additionalProperties: false,
};
