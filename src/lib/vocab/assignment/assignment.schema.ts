export const AssignmentSchema = {
	$id: '/schemas/Assignment.json',
	type: 'object',
	description: `
	 Describes the relationship between a Persona and Role within a given Community.
	 A Persona must have at least 1 assignment to be in a Community and see it in the nav.
	 When initially joining a Community, Personas are given an Assignment to the default Role.
	`,
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
