import type {User} from '../vocab/user/user.js';
import type {Entity} from '../vocab/entity/entity.js';

export type ClientSession = UserSession | GuestSession;

export type ClientUser = Pick<User, 'name'>;

export interface UserSession {
	user: ClientUser;
	entities: Entity[];
	guest?: false; // is only for types; this property doesn't exist at runtime
}

export interface GuestSession {
	guest: true;
}
