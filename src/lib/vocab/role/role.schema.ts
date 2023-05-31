import type {VocabSchema} from '@feltjs/gro';

export const RoleIdSchema = {
	$id: '/schemas/RoleId',
	type: 'number',
	tsType: "Flavored<number, 'RoleId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
} satisfies VocabSchema;

export const RoleSchema = {
	$id: '/schemas/Role',
	type: 'object',
	description: `
		Roles are user-defined governance objects that exist within the context of a single Hub.
		They have Policies associated with them that allow for actions to be taken within the system.
		When an Actor has a Role via an Assignment, that actor may take any action allowed by the Role's Policies.
	`,
	properties: {
		role_id: {$ref: '/schemas/RoleId'},
		hub_id: {$ref: '/schemas/HubId'},
		name: {type: 'string'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['role_id', 'hub_id', 'name', 'created', 'updated'],
	additionalProperties: false,
} satisfies VocabSchema;
