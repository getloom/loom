// generated by src/lib/vocab/hub/hub.schema.ts

import type {Flavored} from '@feltjs/util';
import type {RoleId} from '$lib/vocab/role/role';

export type HubId = Flavored<number, 'HubId'>;

/**
 * Hubs represent the membrane around the places Actors can interact with each other or with system level data.
 * They have self contained governance and ownership of Spaces within them.
 * By default they are hidden & undiscoverable and are only visible to a user once an Actor has been invited in.
 */
export interface Hub {
	hub_id: HubId;
	type: 'community' | 'personal';
	name: string;
	/**
	 * A nested set of attributes on Hub. Holds all hub level settings.
	 */
	settings: HubSettings;
	created: Date;
	updated: Date | null;
}
/**
 * A nested set of attributes on Hub. Holds all hub level settings.
 */
export interface HubSettings {
	hue: number;
	defaultRoleId: RoleId;
	instance?: {
		allowedAccountNames?: string[];
		disableCreateHub?: boolean;
		defaultHubIds?: HubId[];
	};
}
/**
 * A subset of HubSettings needed for defaults at the time of Hub creation.
 */
export interface InitialHubSettings {
	hue: number;
}

// generated by src/lib/vocab/hub/hub.schema.ts
