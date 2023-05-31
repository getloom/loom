import type {VocabSchema} from '@feltjs/gro';

export const AssignmentIdSchema = {
	$id: '/schemas/AssignmentId',
	type: 'number',
	tsType: "Flavored<number, 'AssignmentId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
} satisfies VocabSchema;

export const AssignmentSchema = {
	$id: '/schemas/Assignment',
	type: 'object',
	description: `
	 Describes the relationship between an Actor and Role within a given Hub.
	 An Actor must have at least 1 Assignment to be in a Hub and see it in the nav.
	 When initially joining a Hub, Actors are given an Assignment to the default Role.
	`,
	properties: {
		assignment_id: {$ref: '/schemas/AssignmentId'},
		actor_id: {$ref: '/schemas/ActorId'},
		hub_id: {$ref: '/schemas/HubId'},
		role_id: {$ref: '/schemas/RoleId'},
		created: {type: 'object', instanceof: 'Date'},
	},
	required: ['assignment_id', 'actor_id', 'hub_id', 'role_id', 'created'],
	additionalProperties: false,
} satisfies VocabSchema;
