export const AssignmentIdSchema = {
	$id: '/schemas/AssignmentId.json',
	type: 'number',
	tsType: "Flavored<number, 'AssignmentId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
};

export const AssignmentSchema = {
	$id: '/schemas/Assignment.json',
	type: 'object',
	description: `
	 Describes the relationship between an Actor and Role within a given Hub.
	 An Actor must have at least 1 Assignment to be in a Hub and see it in the nav.
	 When initially joining a Hub, Actors are given an Assignment to the default Role.
	`,
	properties: {
		assignment_id: {$ref: '/schemas/AssignmentId.json'},
		actor_id: {$ref: '/schemas/ActorId.json'},
		hub_id: {$ref: '/schemas/HubId.json'},
		role_id: {$ref: '/schemas/RoleId.json'},
		created: {type: 'object', instanceof: 'Date'},
	},
	required: ['assignment_id', 'actor_id', 'hub_id', 'role_id', 'created'],
	additionalProperties: false,
};
