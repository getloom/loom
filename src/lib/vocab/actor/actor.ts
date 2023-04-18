// generated by src/lib/vocab/actor/actor.schema.ts

import type {AccountId} from '$lib/vocab/account/account';
import type {HubId} from '$lib/vocab/hub/hub';
import type {Flavored} from '@feltjs/util';

/**
 *
 * 		Represents a human actor logged in via an Account. They are owned and managed from the account level.
 * 		When an AccountActor is created, a personal Hub is also created for it and associated via 'hub_id'.
 * 		A reference to this personal Hub is stored in 'hub_id'.
 *
 */
export interface AccountActor {
	actor_id: ActorId;
	account_id: AccountId;
	hub_id: HubId;
	type: 'account';
	name: string;
	icon?: string;
	created: Date;
	updated: Date | null;
}
export type ActionActor = AccountActor | CommunityActor;

export type ActorId = Flavored<number, 'ActorId'>;

/**
 *
 * 	 Actors perform actions in the system. They can be of type Account, Hub, or Ghost.
 *
 */
export type Actor = AccountActor | CommunityActor | GhostActor;

/**
 *
 * 		The union of Actor subsets a user sees on their client,
 * 		including the user's AccountActors and all other hub actors as PublicActors.
 *
 */
export type ClientActor = AccountActor | PublicActor;

/**
 *
 * 		Represents a collective actor under the ownership of a Hub.
 * 		Currently, these are only created when a new Hub is made and have no extended functionality within the system.
 * 		The Hub that owns it is represented by 'hub_id'.
 *
 */
export interface CommunityActor {
	actor_id: ActorId;
	account_id?: null;
	hub_id: HubId;
	type: 'community';
	name: string;
	icon?: string;
	created: Date;
	updated: Date | null;
}
/**
 *
 * 	 A special system-level Actor that is a placeholder for deleted or otherwise unavailable Actors.
 *
 */
export interface GhostActor {
	actor_id: ActorId;
	account_id?: null;
	hub_id?: null;
	type: 'ghost';
	name: string;
	icon?: string;
	created: Date;
	updated: Date | null;
}
/**
 *
 * 		A subset of an Actor available to all clients in a hub.
 *
 */
export interface PublicActor {
	actor_id: ActorId;
	type: 'account' | 'community' | 'ghost';
	name: string;
	icon?: string;
	created: Date;
}

// generated by src/lib/vocab/actor/actor.schema.ts
