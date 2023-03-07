export const EntitySchema = {
	$id: '/schemas/Entity.json',
	type: 'object',
	description: `
		An Entity is the core data type that represents an ActivityStreams object in the system.
		Each has an "owning" space & persona that controls its governance.
		Entities exist within a graph architecture, with Ties serving as the paths between nodes.
		Conventionally, all entities within a given Space can be found by traversing
		the graph starting at the directory Entity associated with the owning Space.
		A directory is an ActivityStreams Collection referenced by each Space.
	`,
	properties: {
		entity_id: {type: 'number'},
		persona_id: {type: 'number'},
		space_id: {type: 'number'},
		path: {anyOf: [{type: 'string'}, {type: 'null'}]},
		data: {
			type: 'object',
			tsType: 'EntityData',
			tsImport: "import type {EntityData} from '$lib/vocab/entity/entityData'",
		},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['entity_id', 'persona_id', 'space_id', 'path', 'data', 'created', 'updated'],
	additionalProperties: false,
};

// TODO expand to the entire vocabulary? generate if so
export type EntityType = 'Persona' | 'Hub';
