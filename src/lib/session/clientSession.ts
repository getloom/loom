import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {ClientAccount} from '$lib/vocab/account/accountHelpers';
import type {Persona} from '$lib/vocab/persona/persona';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Role} from '$lib/vocab/role/role';

export type ClientSession = ClientAccountSession | ClientGuestSession;

export interface ClientAccountSession {
	account: ClientAccount;
	sessionPersonas: Persona[];
	communities: Community[];
	roles: Role[];
	spaces: Space[];
	directories: Entity[];
	assignments: Assignment[];
	personas: Persona[];
	guest?: false; // is only for types; this property doesn't exist at runtime
}

export interface ClientGuestSession {
	guest: true;
}
