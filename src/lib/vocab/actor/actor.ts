import type {AccountId} from '$lib/vocab/account/account';
import type {HubId} from '$lib/vocab/hub/hub';
import type {Flavored} from '@ryanatkn/belt/types.js';

/**
 * Represents a human actor logged in via an <Vocab name="Account" />. They are owned and managed from the account level.
 * When an AccountActor is created, a personal <Vocab name="Hub" /> is also created for it and associated via <code>hub_id</code>.
 * A reference to this personal <Vocab name="Hub" /> is stored in <code>hub_id</code>.
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
export type ActionActor = AccountActor | HubActor;

export type ActorId = Flavored<number, 'ActorId'>;

/**
 * The full database record for the various <Vocab name="Actor" /> types.
 */
export interface ActorRecord {
	actor_id: ActorId;
	account_id: AccountId;
	hub_id: HubId;
	type: 'account' | 'community' | 'ghost';
	name: string;
	icon: string;
	created: Date;
	updated: Date | null;
}
/**
 * <Vocab name="Actor" />s perform actions in the system.
 * They can be of type <code>'account'</code>, <code>'hub'</code>, or <code>'ghost'</code>.
 */
export type Actor = AccountActor | HubActor | GhostActor;

/**
 * The union of <Vocab name="Actor" /> subsets a user sees on their client,
 * including the user's <Vocab name="AccountActors" /> and all other hub actors as <Vocab name="PublicActors" />.
 */
export type ClientActor = AccountActor | PublicActor;

/**
 * A special system-level <Vocab name="Actor" /> that is a placeholder for deleted or otherwise unavailable <Vocab name="Actor" />s.
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
 * Represents a collective actor under the ownership of a <Vocab name="Hub" />.
 * Currently, these are only created when a new <Vocab name="Hub" /> is made and have no extended functionality within the system.
 * The <Vocab name="Hub" /> that owns it is represented by <code>hub_id</code>.
 */
export interface HubActor {
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
 * A subset of an <Vocab name="Actor" /> available to all clients in a <Vocab name="Hub" />.
 */
export interface PublicActor {
	actor_id: ActorId;
	type: 'account' | 'community' | 'ghost';
	name: string;
	icon?: string;
	created: Date;
}
