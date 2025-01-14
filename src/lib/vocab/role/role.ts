import type {Flavored} from '@ryanatkn/belt/types.js';
import type {HubId} from '$lib/vocab/hub/hub';

export type RoleId = Flavored<number, 'RoleId'>;

/**
 * <Vocab name="Role" />s are user-defined governance objects that exist within the context of a single <Vocab name="Hub" />.
 * They have <Vocab name="Policy" />s associated with them that allow for actions to be taken within the system.
 * When an <Vocab name="Actor" /> has a <Vocab name="Role" /> via an <Vocab name="Assignment" />,
 * that actor may take any action allowed by the role's <Vocab name="Policy" />s.
 */
export interface Role {
	role_id: RoleId;
	hub_id: HubId;
	name: string;
	created: Date;
	updated: Date | null;
}
