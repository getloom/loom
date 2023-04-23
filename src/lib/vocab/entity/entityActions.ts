import {DEFAULT_PAGE_SIZE} from '$lib/app/constants';
import type {ClientActionData, ServiceActionData} from '$lib/vocab/action/action';

export const CreateEntity: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateEntity',
	broadcast: true,
	params: {
		$id: '/schemas/CreateEntityParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			space_id: {
				$ref: '/schemas/SpaceId.json',
				tsType: 'SpaceId',
				tsImport: "import type {SpaceId} from '$lib/vocab/space/space'",
			},
			path: {anyOf: [{type: 'string'}, {type: 'null'}]},
			data: {type: 'object', tsType: 'EntityData'},
			ties: {
				type: 'array',
				items: {
					anyOf: [
						{
							type: 'object',
							properties: {
								source_id: {
									$ref: '/schemas/EntityId.json',
									tsType: 'EntityId',
									tsImport: "import type {EntityId} from '$lib/vocab/entity/entity'",
								},
								type: {type: 'string'},
							},
							required: ['source_id'],
							additionalProperties: false,
						},
						{
							type: 'object',
							properties: {
								dest_id: {
									$ref: '/schemas/EntityId.json',
									tsType: 'EntityId',
									tsImport: "import type {EntityId} from '$lib/vocab/entity/entity'",
								},
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
		$id: '/schemas/CreateEntityResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
			ties: {type: 'array', items: {$ref: '/schemas/Tie.json', tsType: 'Tie'}},
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
		$id: '/schemas/UpdateEntitiesParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			entities: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						entity_id: {
							$ref: '/schemas/EntityId.json',
							tsType: 'EntityId',
							tsImport: "import type {EntityId} from '$lib/vocab/entity/entity'",
						},
						data: {type: 'object', tsType: 'EntityData'},
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
		$id: '/schemas/UpdateEntitiesResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
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
		$id: '/schemas/ReadEntitiesParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			source_id: {
				$ref: '/schemas/EntityId.json',
				tsType: 'EntityId',
				tsImport: "import type {EntityId} from '$lib/vocab/entity/entity'",
			},
		},
		required: ['actor', 'source_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadEntitiesResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
			ties: {type: 'array', items: {$ref: '/schemas/Tie.json', tsType: 'Tie'}},
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
		$id: '/schemas/QueryEntitiesResponse.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			source_id: {
				$ref: '/schemas/EntityId.json',
				tsType: 'EntityId',
				tsImport: "import type {EntityId} from '$lib/vocab/entity/entity'",
			},
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
		$id: '/schemas/ReadEntitiesPaginatedParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			source_id: {
				$ref: '/schemas/EntityId.json',
				tsType: 'EntityId',
				tsImport: "import type {EntityId} from '$lib/vocab/entity/entity'",
			},
			pageSize: {type: 'number', maximum: DEFAULT_PAGE_SIZE},
			pageKey: {type: 'number'},
			related: {type: 'string', enum: ['source', 'dest', 'both']},
		},
		required: ['actor', 'source_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadEntitiesPaginatedResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
			ties: {type: 'array', items: {$ref: '/schemas/Tie.json', tsType: 'Tie'}},
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
		$id: '/schemas/EraseEntitiesParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			entityIds: {
				type: 'array',
				items: {
					$ref: '/schemas/EntityId.json',
					tsType: 'EntityId',
					tsImport: "import type {EntityId} from '$lib/vocab/entity/entity'",
				},
			},
		},
		required: ['actor', 'entityIds'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/EraseEntitiesResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
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
		$id: '/schemas/DeleteEntitiesParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			entityIds: {
				type: 'array',
				items: {
					$ref: '/schemas/EntityId.json',
					tsType: 'EntityId',
					tsImport: "import type {EntityId} from '$lib/vocab/entity/entity'",
				},
			},
		},
		required: ['actor', 'entityIds'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteEntitiesResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
			deleted: {
				type: 'array',
				items: {
					$ref: '/schemas/EntityId.json',
					tsType: 'EntityId',
					tsImport: "import type {EntityId} from '$lib/vocab/entity/entity'",
				},
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
	broadcast: true,
	params: {
		$id: '/schemas/ReadEntitiesByIdParams.json',
		type: 'object',
		properties: {
			actor: {$ref: '/schemas/ActorId.json', tsType: 'ActorId'},
			entityIds: {type: 'array', items: {$ref: '/schemas/EntityId.json', tsType: 'EntityId'}},
		},
		required: ['actor', 'entityIds'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadEntitiesByIdResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
		},
		required: ['entities'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadEntitiesByIdResponseResult>',
	route: {
		path: '/api/v1/entities/fetch',
		method: 'POST',
	},
};
