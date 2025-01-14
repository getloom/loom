import type {Flavored} from '@ryanatkn/belt/types.js';
import type {AccountActor, ClientActor} from '$lib/vocab/actor/actor';
import type {Hub} from '$lib/vocab/hub/hub';
import type {Role} from '$lib/vocab/role/role';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {EntityData} from '$lib/vocab/entity/entityData.js';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {Policy} from '$lib/vocab/policy/policy';

export type AccountId = Flavored<number, 'AccountId'>;

/**
 * Represents the point of entry to the system and is responsible for managing authentication to the system.
 * It holds top level user data and is the relation through which all other data is loaded for the client.
 */
export interface Account {
	account_id: AccountId;
	name: string;
	password: string;
	/**
	 * A nested set of attributes on <Vocab name="Account" /> and <Vocab name="ClientAccount" />. Holds all account level settings.
	 */
	settings: AccountSettings;
	created: Date;
	updated: Date | null;
}
/**
 * A nested set of attributes on <Vocab name="Account" /> and <Vocab name="ClientAccount" />. Holds all account level settings.
 */
export interface AccountSettings {
	darkmode?: boolean;
}
/**
 * A client-facing subset of an <Vocab name="Account" />. Excludes <code>password</code> for security.
 */
export interface ClientAccount {
	account_id: AccountId;
	name: string;
	/**
	 * A nested set of attributes on <Vocab name="Account" /> and <Vocab name="ClientAccount" />. Holds all account level settings.
	 */
	settings: AccountSettings;
	created: Date;
	updated: Date | null;
}
/**
 * The session data loaded on each page for authenticated users.
 */
export interface ClientAccountSession {
	/**
	 * A client-facing subset of an <Vocab name="Account" />. Excludes <code>password</code> for security.
	 */
	account: ClientAccount;
	sessionActors: AccountActor[];
	hubs: Hub[];
	roles: Role[];
	spaces: Space[];
	directories: Array<Entity & {data: EntityData}>;
	assignments: Assignment[];
	policies: Policy[];
	actors: ClientActor[];
	guest?: false;
}
/**
 * A type of <Vocab name="ClientSession" />. Loaded for un-authenticated users, it simply indicates a user is a guest to the client.
 */
export interface ClientGuestSession {
	guest: true;
}
/**
 * The session data loaded on each page for authenticated and unauthenticated users.
 */
export type ClientSession = ClientAccountSession | ClientGuestSession;
