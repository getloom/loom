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
		assignment_id: {$ref: '/schemas/AssignmentId.json', tsType: 'AssignmentId'},
		actor_id: {
			$ref: '/schemas/ActorId.json',
			tsType: 'ActorId',
			tsImport: "import type {ActorId} from '$lib/vocab/actor/actor'",
		},
		hub_id: {
			$ref: '/schemas/HubId.json',
			tsType: 'HubId',
			tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
		},
		role_id: {
			$ref: '/schemas/RoleId.json',
			tsType: 'RoleId',
			tsImport: "import type {RoleId} from '$lib/vocab/role/role'",
		},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
	},
	required: ['assignment_id', 'actor_id', 'hub_id', 'role_id', 'created'],
	additionalProperties: false,
};
