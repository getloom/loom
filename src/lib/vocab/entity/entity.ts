import type {Flavored} from '@ryanatkn/belt/types.js';
import type {ActorId} from '$lib/vocab/actor/actor';
import type {SpaceId} from '$lib/vocab/space/space';
import type {HubId} from '$lib/vocab/hub/hub';
import type {EntityData} from '$lib/vocab/entity/entityData.js';

export type EntityId = Flavored<number, 'EntityId'>;

/**
 * An <Vocab name="Entity" /> is the core data type that represents an ActivityStreams object in the system.
 * Each has an "owning" space and actor that controls its governance.
 * <Vocab name="Entity" /> objects exist within a graph architecture, with <Vocab name="Tie" /> objects serving as the edges between nodes.
 * Conventionally, all entities within a given <Vocab name="Space" /> can be found by traversing
 * the graph starting at the directory <Vocab name="Entity" /> associated with the owning <Vocab name="Space" />.
 * A directory is an ActivityStreams Collection referenced by each <Vocab name="Space" />.
 */
export interface Entity {
	entity_id: EntityId;
	actor_id: ActorId;
	space_id: SpaceId;
	directory_id: EntityId;
	hub_id: HubId;
	path: string | null;
	data: EntityData;
	created: Date;
	updated: Date | null;
}
