// generated by src/lib/vocab/entity/entity.schema.ts

import type {ActorId} from '$lib/vocab/actor/actor';
import type {EntityData} from '$lib/vocab/entity/entityData';

/**
 *
 * 		An Entity is the core data type that represents an ActivityStreams object in the system.
 * 		Each has an "owning" space & persona that controls its governance.
 * 		Entities exist within a graph architecture, with Ties serving as the paths between nodes.
 * 		Conventionally, all entities within a given Space can be found by traversing
 * 		the graph starting at the directory Entity associated with the owning Space.
 * 		A directory is an ActivityStreams Collection referenced by each Space.
 *
 */
export interface Entity {
	entity_id: number;
	persona_id: ActorId;
	space_id: number;
	path: string | null;
	data: EntityData;
	created: Date;
	updated: Date | null;
}

// generated by src/lib/vocab/entity/entity.schema.ts
