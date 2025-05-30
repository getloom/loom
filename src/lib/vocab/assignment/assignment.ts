import type {Flavored} from '@ryanatkn/belt/types.js';
import type {ActorId} from '$lib/vocab/actor/actor';
import type {HubId} from '$lib/vocab/hub/hub';
import type {RoleId} from '$lib/vocab/role/role';

export type AssignmentId = Flavored<number, 'AssignmentId'>;

/**
 * Describes the relationship between an <Vocab name="Actor" /> and <Vocab name="Role" /> within a given <Vocab name="Hub" />.
 * An <Vocab name="Actor" /> must have at least 1 <Vocab name="Assignment" /> to be in a <Vocab name="Hub" /> and see it in the nav.
 * When initially joining a <Vocab name="Hub" />, <Vocab name="Actor" />s are given an <Vocab name="Assignment" /> to the default <Vocab name="Role" />.
 */
export interface Assignment {
	assignment_id: AssignmentId;
	actor_id: ActorId;
	hub_id: HubId;
	role_id: RoleId;
	created: Date;
}
