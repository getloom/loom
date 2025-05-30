import type {Flavored} from '@ryanatkn/belt/types.js';
import type {HubId} from '$lib/vocab/hub/hub';
import type {EntityId} from '$lib/vocab/entity/entity';

export type SpaceId = Flavored<number, 'SpaceId'>;

/**
 * <Vocab name="Space" />s are subdivisions within a <Vocab name="Hub" /> that hold a View and reference to an <Vocab name="Entity" /> directory.
 * The View is used to interpret, visualize, and manipulate the <Vocab name="Entity" />s connected to the directory.
 * Each is a Svelte component that conforms to the View interface.
 */
export interface Space {
	space_id: SpaceId;
	name: string;
	icon: string;
	view: string;
	created: Date;
	updated: Date | null;
	hub_id: HubId;
	directory_id: EntityId;
}
