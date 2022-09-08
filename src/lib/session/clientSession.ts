import type {Community} from '$lib/vocab/community/community.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {AccountModel} from '$lib/vocab/account/account.js';
import type {Persona} from '$lib/vocab/persona/persona.js';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Entity} from '$lib/vocab/entity/entity';

export type ClientSession = ClientAccountSession | ClientGuestSession;

export interface ClientAccountSession {
	account: AccountModel;
	sessionPersonas: Persona[];
	communities: Community[];
	spaces: Space[];
	directories: Entity[];
	memberships: Membership[];
	personas: Persona[];
	guest?: false; // is only for types; this property doesn't exist at runtime
}

export interface ClientGuestSession {
	guest: true;
}
