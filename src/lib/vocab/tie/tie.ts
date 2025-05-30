import type {Flavored} from '@ryanatkn/belt/types.js';
import type {EntityId} from '$lib/vocab/entity/entity';

export type TieId = Flavored<number, 'TieId'>;

/**
 * <Vocab name="Tie" />s are part of the <Vocab name="Entity" />/<Vocab name="Tie" /> graph data system.
 * Each represents a named, directional relationship between two entities.
 * A <Vocab name="Tie" /> specifies "the [source] has relationship of [type] with [dest]."
 */
export interface Tie {
	tie_id: TieId;
	source_id: EntityId;
	dest_id: EntityId;
	type: string;
	created: Date;
}
