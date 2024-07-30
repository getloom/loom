import type {Flavored} from '@ryanatkn/belt/types.js';
import type {RoleId} from '$lib/vocab/role/role';
import type {ActorId} from '../actor/actor';

export type HubId = Flavored<number, 'HubId'>;

/**
 * <Vocab name="Hub" />s represent the membrane around the places <Vocab name="Actor" />s can interact with each other or with system level data.
 * They have self contained governance and ownership of <Vocab name="Space" />s within them.
 * By default they are hidden and undiscoverable and are only visible to a user once an <Vocab name="Actor" /> has been invited in.
 */
export interface Hub {
	hub_id: HubId;
	type: 'community' | 'personal';
	name: string;
	/**
	 * A nested set of attributes on <Vocab name="Hub" />. Holds all hub level settings.
	 */
	settings: HubSettings;
	created: Date;
	updated: Date | null;
}
/**
 * A nested set of attributes on <Vocab name="Hub" />. Holds all hub level settings.
 */
export interface HubSettings {
	hue: number;
	defaultRoleId: RoleId;
	instance?: InstanceSettings;
}

/**
 * The instance admin specific settings
 */
export interface InstanceSettings {
	allowedAccountNames?: string[];
	disableCreateHub?: boolean;
	allowedHubCreationAccounts?: ActorId[];
	defaultHubIds?: HubId[];
	minPasswordLength?: number;
	site?: {
		sourceRepo?: string;
	};
}

/**
 * A subset of <Vocab name="HubSettings" /> needed for defaults at the time of <Vocab name="Hub" /> creation.
 */
export interface InitialHubSettings {
	hue: number;
}
