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
	 Describes the relationship between a Persona and Role within a given Hub.
	 A Persona must have at least 1 assignment to be in a Hub and see it in the nav.
	 When initially joining a Hub, Actors are given an Assignment to the default Role.
	`,
	properties: {
		assignment_id: {type: 'number', tsType: 'AssignmentId'},
		persona_id: {
			type: 'number',
			tsType: 'ActorId',
			tsImport: "import type {ActorId} from '$lib/vocab/actor/actor'",
		},
		hub_id: {
			type: 'number',
			tsType: 'HubId',
			tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
		},
		role_id: {type: 'number'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
	},
	required: ['assignment_id', 'persona_id', 'hub_id', 'role_id', 'created'],
	additionalProperties: false,
};
