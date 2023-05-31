import type {VocabSchema} from '@feltjs/gro';

export const SpaceIdSchema = {
	$id: '/schemas/SpaceId',
	type: 'number',
	tsType: "Flavored<number, 'SpaceId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
} satisfies VocabSchema;

export const SpaceSchema = {
	$id: '/schemas/Space',
	type: 'object',
	description: `
	 Spaces are subdivisions within a Hub that hold a View and reference to an Entity directory.
	 The View is used to interpret, visualize, and manipulate the Entities connected to the directory.
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
} satisfies VocabSchema;
