export const SpaceSchema = {
	$id: '/schemas/Space.json',
	type: 'object',
	description: `
	 Spaces are subdivisions within a Community that hold a View and reference to an Entity directory.
	 The View is used to interpret, visualize, and manipulate the Entities connected to the directory.
	 Each is a Svelte component that conforms to the View interface.
 `,
	properties: {
		space_id: {type: 'number'},
		name: {type: 'string'},
		path: {type: 'string'},
		icon: {type: 'string'},
		view: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
		community_id: {type: 'number'},
		directory_id: {type: 'number'},
	},
	required: [
		'space_id',
		'name',
		'path',
		'icon',
		'view',
		'created',
		'updated',
		'community_id',
		'directory_id',
	],
	additionalProperties: false,
};
