export const SpaceSchema = {
	$id: '/schemas/Space.json',
	type: 'object',
	properties: {
		space_id: {type: 'number'},
		name: {type: 'string'},
		url: {type: 'string'},
		icon: {type: 'string'},
		view: {
			type: 'object',
			tsType: 'ViewData',
			tsImport: "import type {ViewData} from '$lib/vocab/view/view'",
		},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
		community_id: {type: 'number'},
	},
	required: ['space_id', 'name', 'url', 'icon', 'view', 'created', 'updated', 'community_id'],
	additionalProperties: false,
};