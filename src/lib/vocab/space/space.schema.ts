export const SpaceSchema = {
	$id: '/schemas/Space.json',
	type: 'object',
	description: `
	 Spaces are subdivisions within a Hub that hold a View and reference to an Entity directory.
	 The View is used to interpret, visualize, and manipulate the Entities connected to the directory.
	 Each is a Svelte component that conforms to the View interface.
 `,
	properties: {
		space_id: {type: 'number'},
		name: {type: 'string'},
		icon: {type: 'string'},
		view: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
		hub_id: {type: 'number'},
		directory_id: {type: 'number'},
	},
	required: ['space_id', 'name', 'icon', 'view', 'created', 'updated', 'hub_id', 'directory_id'],
	additionalProperties: false,
};
