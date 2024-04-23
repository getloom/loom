import type {Json_Schema} from '@grogarden/gro/schema.js';

export const AssignmentIdSchema = {
	$id: '/schemas/AssignmentId',
	type: 'number',
	tsType: "Flavored<number, 'AssignmentId'>",
	tsImport: "import {Flavored} from '@ryanatkn/belt/types.js'",
} satisfies Json_Schema;

export const AssignmentSchema = {
	$id: '/schemas/Assignment',
	type: 'object',
	description: `
	 Describes the relationship between an <Vocab name="Actor" /> and <Vocab name="Role" /> within a given <Vocab name="Hub" />.
	 An <Vocab name="Actor" /> must have at least 1 <Vocab name="Assignment" /> to be in a <Vocab name="Hub" /> and see it in the nav.
	 When initially joining a <Vocab name="Hub" />, <Vocab name="Actor" />s are given an <Vocab name="Assignment" /> to the default <Vocab name="Role" />.
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
} satisfies Json_Schema;
