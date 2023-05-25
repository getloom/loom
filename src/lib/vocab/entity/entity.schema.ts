import type {VocabSchema} from '@feltjs/gro';

export const EntityIdSchema = {
	$id: '/schemas/EntityId.json',
	type: 'number',
	tsType: "Flavored<number, 'EntityId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
} satisfies VocabSchema;

export const EntitySchema = {
	$id: '/schemas/Entity.json',
	type: 'object',
	description: `
		An Entity is the core data type that represents an ActivityStreams object in the system.
		Each has an "owning" space and actor that controls its governance.
		Entities exist within a graph architecture, with Ties serving as the paths between nodes.
		Conventionally, all entities within a given Space can be found by traversing
		the graph starting at the directory Entity associated with the owning Space.
		A directory is an ActivityStreams Collection referenced by each Space.
	`,
	properties: {
		entity_id: {$ref: '/schemas/EntityId.json'},
		actor_id: {$ref: '/schemas/ActorId.json'},
		space_id: {$ref: '/schemas/SpaceId.json'},
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

// TODO expand to the entire vocabulary? generate if so
export type EntityType = 'Actor' | 'Hub';
