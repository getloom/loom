import type {Json_Schema} from '@grogarden/gro/schema.js';

export const SpaceIdSchema = {
	$id: '/schemas/SpaceId',
	type: 'number',
	tsType: "Flavored<number, 'SpaceId'>",
	tsImport: "import {Flavored} from '@grogarden/util/types.js'",
} satisfies Json_Schema;

export const SpaceSchema = {
	$id: '/schemas/Space',
	type: 'object',
	description: `
	 <Vocab name="Space" />s are subdivisions within a <Vocab name="Hub" /> that hold a View and reference to an <Vocab name="Entity" /> directory.
	 The View is used to interpret, visualize, and manipulate the <Vocab name="Entity" />s connected to the directory.
	 Each is a Svelte component that conforms to the View interface.
 `,
	properties: {
		space_id: {$ref: '/schemas/SpaceId'},
		name: {type: 'string'},
		icon: {type: 'string'},
		view: {type: 'string'},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
		hub_id: {$ref: '/schemas/HubId'},
		directory_id: {$ref: '/schemas/EntityId'},
	},
	required: ['space_id', 'name', 'icon', 'view', 'created', 'updated', 'hub_id', 'directory_id'],
	additionalProperties: false,
} satisfies Json_Schema;
