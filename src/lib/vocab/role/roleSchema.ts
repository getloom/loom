import type {Json_Schema} from '$lib/util/schema.js';

export const RoleIdSchema = {
	$id: '/schemas/RoleId',
	type: 'number',
	tsType: "Flavored<number, 'RoleId'>",
	tsImport: "import {Flavored} from '@ryanatkn/belt/types.js'",
} satisfies Json_Schema;

export const RoleSchema = {
	$id: '/schemas/Role',
	type: 'object',
	description: `
		<Vocab name="Role" />s are user-defined governance objects that exist within the context of a single <Vocab name="Hub" />.
		They have <Vocab name="Policy" />s associated with them that allow for actions to be taken within the system.
		When an <Vocab name="Actor" /> has a <Vocab name="Role" /> via an <Vocab name="Assignment" />,
		that actor may take any action allowed by the role's <Vocab name="Policy" />s.
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
} satisfies Json_Schema;
