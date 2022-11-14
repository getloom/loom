import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {AccountPersona, ClientPersona} from '$lib/vocab/persona/persona';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {ClientAccount} from '$lib/vocab/account/accountHelpers';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Role} from '$lib/vocab/role/role';

export type ClientSession = ClientAccountSession | ClientGuestSession;

export interface ClientAccountSession {
	account: ClientAccount;
	sessionPersonas: AccountPersona[];
	communities: Community[];
	roles: Role[];
	spaces: Space[];
	directories: Entity[];
	assignments: Assignment[];
	personas: ClientPersona[];
	guest?: false; // is only for types; this property doesn't exist at runtime
}

export interface ClientGuestSession {
	guest: true;
}
