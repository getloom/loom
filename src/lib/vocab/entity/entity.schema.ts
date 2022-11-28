export const EntitySchema = {
	$id: '/schemas/Entity.json',
	type: 'object',
	properties: {
		entity_id: {type: 'number'},
		persona_id: {type: 'number'},
		data: {
			type: 'object',
			tsType: 'EntityData',
			tsImport: "import type {EntityData} from '$lib/vocab/entity/entityData'",
		},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['entity_id', 'persona_id', 'data', 'created', 'updated'],
	additionalProperties: false,
};

// TODO expand to the entire vocabulary? generate if so
export type EntityType = 'Persona' | 'Community';
