import {DEFAULT_PAGE_SIZE} from '$lib/app/constants';
import type {ClientActionData, ServiceActionData} from '$lib/vocab/action/action';

export const CreateEntity: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateEntity',
	broadcast: true,
	params: {
		$id: '/schemas/CreateEntityParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			space_id: {$ref: '/schemas/SpaceId'},
			path: {anyOf: [{type: 'string'}, {type: 'null'}]},
			data: {
				type: 'object',
				tsType: 'EntityData',
				tsImport: "import type {EntityData} from '$lib/vocab/entity/entityData'",
			},
			ties: {
				type: 'array',
				items: {
					anyOf: [
						{
							type: 'object',
							properties: {
								source_id: {$ref: '/schemas/EntityId'},
								type: {type: 'string'},
							},
							required: ['source_id'],
							additionalProperties: false,
						},
						{
							type: 'object',
							properties: {
								dest_id: {$ref: '/schemas/EntityId'},
								type: {type: 'string'},
							},
							required: ['dest_id'],
							additionalProperties: false,
						},
					],
				},
			},
		},
		required: ['actor', 'space_id', 'data'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateEntityResponse',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity'}},
			ties: {type: 'array', items: {$ref: '/schemas/Tie'}},
		},
		required: ['entities', 'ties'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateEntityResponseResult>',
	route: {
		path: '/api/v1/entities',
		method: 'POST',
	},
};

export const UpdateEntities: ServiceActionData = {
	type: 'ServiceAction',
	name: 'UpdateEntities',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateEntitiesParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			entities: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						entity_id: {$ref: '/schemas/EntityId'},
						data: {
							type: 'object',
							tsType: 'EntityData',
							tsImport: "import type {EntityData} from '$lib/vocab/entity/entityData'",
						},
						path: {anyOf: [{type: 'string'}, {type: 'null'}]},
					},
					required: ['entity_id'],
					additionalProperties: false,
				},
			},
		},
		required: ['actor', 'entities'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateEntitiesResponse',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity'}},
		},
		required: ['entities'],
		additionalProperties: false,
	},
	returns: 'Promise<UpdateEntitiesResponseResult>',
	route: {
		path: '/api/v1/entities/update',
		method: 'POST',
	},
};

export const ReadEntities: ServiceActionData = {
	type: 'ServiceAction',
	name: 'ReadEntities',
	params: {
		$id: '/schemas/ReadEntitiesParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			source_id: {$ref: '/schemas/EntityId'},
		},
		required: ['actor', 'source_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadEntitiesResponse',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity'}},
			ties: {type: 'array', items: {$ref: '/schemas/Tie'}},
		},
		required: ['entities', 'ties'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadEntitiesResponseResult>',
	route: {
		path: '/api/v1/entities/source/:source_id',
		method: 'GET',
	},
};

export const QueryEntities: ClientActionData = {
	type: 'ClientAction',
	name: 'QueryEntities',
	params: {
		$id: '/schemas/QueryEntitiesResponse',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			source_id: {$ref: '/schemas/EntityId'},
		},
		required: ['actor', 'source_id'],
		additionalProperties: false,
	},
	returns: 'Query',
};

export const ReadEntitiesPaginated: ServiceActionData = {
	type: 'ServiceAction',
	name: 'ReadEntitiesPaginated',
	params: {
		$id: '/schemas/ReadEntitiesPaginatedParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			source_id: {$ref: '/schemas/EntityId'},
			pageSize: {type: 'number', maximum: DEFAULT_PAGE_SIZE},
			pageKey: {type: 'number'},
			related: {type: 'string', enum: ['source', 'dest', 'both']},
		},
		required: ['actor', 'source_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadEntitiesPaginatedResponse',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity'}},
			ties: {type: 'array', items: {$ref: '/schemas/Tie'}},
		},
		required: ['entities', 'ties'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadEntitiesPaginatedResponseResult>',
	route: {
		path: '/api/v1/entities/source/:source_id/paginated',
		method: 'GET',
	},
};

export const EraseEntities: ServiceActionData = {
	type: 'ServiceAction',
	name: 'EraseEntities',
	broadcast: true,
	params: {
		$id: '/schemas/EraseEntitiesParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			entityIds: {
				type: 'array',
				items: {$ref: '/schemas/EntityId'},
			},
		},
		required: ['actor', 'entityIds'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/EraseEntitiesResponse',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity'}},
		},
		required: ['entities'],
		additionalProperties: false,
	},
	returns: 'Promise<EraseEntitiesResponseResult>',
	route: {
		path: '/api/v1/entities/erase',
		method: 'DELETE',
	},
};

export const DeleteEntities: ServiceActionData = {
	type: 'ServiceAction',
	name: 'DeleteEntities',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteEntitiesParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			entityIds: {
				type: 'array',
				items: {$ref: '/schemas/EntityId'},
			},
		},
		required: ['actor', 'entityIds'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteEntitiesResponse',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity'}},
			deleted: {
				type: 'array',
				items: {$ref: '/schemas/EntityId'},
			},
		},
		required: ['entities', 'deleted'],
		additionalProperties: false,
	},
	returns: 'Promise<DeleteEntitiesResponseResult>',
	route: {
		path: '/api/v1/entities/delete',
		method: 'DELETE',
	},
};

export const ReadEntitiesById: ServiceActionData = {
	type: 'ServiceAction',
	name: 'ReadEntitiesById',
	params: {
		$id: '/schemas/ReadEntitiesByIdParams',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId'},
			entityIds: {type: 'array', items: {$ref: '/schemas/EntityId'}},
		},
		required: ['actor', 'entityIds'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadEntitiesByIdResponse',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity'}},
		},
		required: ['entities'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadEntitiesByIdResponseResult>',
	route: {
		path: '/api/v1/entities/ids',
		method: 'GET',
	},
};
