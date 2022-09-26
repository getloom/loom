export const TieSchema = {
	$id: '/schemas/Tie.json',
	type: 'object',
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
