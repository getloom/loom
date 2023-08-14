import type {VocabSchema} from '@feltjs/gro';

export const EntityIdSchema = {
	$id: '/schemas/EntityId',
	type: 'number',
	tsType: "Flavored<number, 'EntityId'>",
	tsImport: "import {Flavored} from '@feltjs/util/types.js';",
} satisfies VocabSchema;

export const EntitySchema = {
	$id: '/schemas/Entity',
	type: 'object',
	description: `
		An <Vocab name="Entity" /> is the core data type that represents an ActivityStreams object in the system.
		Each has an "owning" space and actor that controls its governance.
		<Vocab name="Entity" /> objects exist within a graph architecture, with <Vocab name="Tie" /> objects serving as the edges between nodes.
		Conventionally, all entities within a given <Vocab name="Space" /> can be found by traversing
		the graph starting at the directory <Vocab name="Entity" /> associated with the owning <Vocab name="Space" />.
		A directory is an ActivityStreams Collection referenced by each <Vocab name="Space" />.
	`,
	properties: {
		entity_id: {$ref: '/schemas/EntityId'},
		actor_id: {$ref: '/schemas/ActorId'},
		space_id: {$ref: '/schemas/SpaceId'},
		path: {anyOf: [{type: 'string'}, {type: 'null'}]},
		data: {
			type: 'object',
			tsType: 'EntityData',
			tsImport: "import type {EntityData} from '$lib/vocab/entity/entityData'",
		},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['entity_id', 'actor_id', 'space_id', 'path', 'data', 'created', 'updated'],
	additionalProperties: false,
} satisfies VocabSchema;
