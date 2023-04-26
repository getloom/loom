export const TieIdSchema = {
	$id: '/schemas/TieId.json',
	type: 'number',
	tsType: "Flavored<number, 'TieId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
};

export const TieSchema = {
	$id: '/schemas/Tie.json',
	type: 'object',
	description: `
		Ties are part of the Entity/Tie graph data system.
		Each represents a named, directional relationship between two entities.
		A Tie specifies "the [source] has relationship of [type] with [dest]."
	`,
	properties: {
		tie_id: {$ref: '/schemas/TieId.json'},
		source_id: {$ref: '/schemas/EntityId.json'},
		dest_id: {$ref: '/schemas/EntityId.json'},
		type: {type: 'string'},
		created: {type: 'object', instanceof: 'Date'},
	},
	required: ['tie_id', 'source_id', 'dest_id', 'type', 'created'],
	additionalProperties: false,
};
