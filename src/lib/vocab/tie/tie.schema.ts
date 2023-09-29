import type {JsonSchema} from '@grogarden/gro/schema.js';

export const TieIdSchema = {
	$id: '/schemas/TieId',
	type: 'number',
	tsType: "Flavored<number, 'TieId'>",
	tsImport: "import {Flavored} from '@grogarden/util/types.js';",
} satisfies JsonSchema;

export const TieSchema = {
	$id: '/schemas/Tie',
	type: 'object',
	description: `
		<Vocab name="Tie" />s are part of the <Vocab name="Entity" />/<Vocab name="Tie" /> graph data system.
		Each represents a named, directional relationship between two entities.
		A <Vocab name="Tie" /> specifies "the [source] has relationship of [type] with [dest]."
	`,
	properties: {
		tie_id: {$ref: '/schemas/TieId'},
		source_id: {$ref: '/schemas/EntityId'},
		dest_id: {$ref: '/schemas/EntityId'},
		type: {type: 'string'},
		created: {type: 'object', instanceof: 'Date'},
	},
	required: ['tie_id', 'source_id', 'dest_id', 'type', 'created'],
	additionalProperties: false,
} satisfies JsonSchema;
