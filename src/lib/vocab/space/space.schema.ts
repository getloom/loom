export const SpaceIdSchema = {
	$id: '/schemas/SpaceId.json',
	type: 'number',
	tsType: "Flavored<number, 'SpaceId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
};

export const SpaceSchema = {
	$id: '/schemas/Space.json',
	type: 'object',
	description: `
	 Spaces are subdivisions within a Hub that hold a View and reference to an Entity directory.
	 The View is used to interpret, visualize, and manipulate the Entities connected to the directory.
	 Each is a Svelte component that conforms to the View interface.
 `,
	properties: {
		space_id: {$ref: '/schemas/SpaceId.json', tsType: 'SpaceId'},
		name: {type: 'string'},
		icon: {type: 'string'},
		view: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
		hub_id: {
			$ref: '/schemas/HubId.json',
			tsType: 'HubId',
			tsImport: "import type {HubId} from '$lib/vocab/hub/hub'",
		},
		directory_id: {
			$ref: '/schemas/EntityId.json',
			tsType: 'EntityId',
			tsImport: "import type {EntityId} from '$lib/vocab/entity/entity'",
		},
	},
	required: ['space_id', 'name', 'icon', 'view', 'created', 'updated', 'hub_id', 'directory_id'],
	additionalProperties: false,
};
