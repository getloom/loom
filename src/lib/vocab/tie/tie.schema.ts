export const TieSchema = {
	$id: '/schemas/Tie.json',
	type: 'object',
	description: `
		Ties are part of the Entity/Tie graph data system.
		Each represents a named, directional relationship between two entities.
		A Tie specifies "the [source] has relationship of [type] with [dest]."
	`,
	properties: {
		tie_id: {type: 'number'},
		source_id: {type: 'number'},
		dest_id: {type: 'number'},
		type: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
	},
	required: ['tie_id', 'source_id', 'dest_id', 'type', 'created'],
	additionalProperties: false,
};
