export const AssignmentSchema = {
	$id: '/schemas/Assignment.json',
	type: 'object',
	properties: {
		assignment_id: {type: 'number'},
		persona_id: {type: 'number'},
		community_id: {type: 'number'},
		role_id: {type: 'number'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
	},
	required: ['assignment_id', 'persona_id', 'community_id', 'role_id', 'created'],
	additionalProperties: false,
};
