// generated by src/lib/vocab/assignment/assignment.schema.ts

import type {Flavored} from '@feltjs/util';
import type {ActorId} from '$lib/vocab/actor/actor';
import type {HubId} from '$lib/vocab/hub/hub';
import type {RoleId} from '$lib/vocab/role/role';

export type AssignmentId = Flavored<number, 'AssignmentId'>;

/**
 * Describes the relationship between an Actor and Role within a given Hub.
 * An Actor must have at least 1 Assignment to be in a Hub and see it in the nav.
 * When initially joining a Hub, Actors are given an Assignment to the default Role.
 */
export interface Assignment {
	assignment_id: AssignmentId;
	actor_id: ActorId;
	hub_id: HubId;
	role_id: RoleId;
	created: Date;
}

// generated by src/lib/vocab/assignment/assignment.schema.ts
