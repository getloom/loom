import type {Flavored} from '@ryanatkn/belt/types.js';
import type {RoleId} from '$lib/vocab/role/role';

export type PolicyId = Flavored<number, 'PolicyId'>;

export type PolicyName =
	| 'ephemera'
	| 'update_hub'
	| 'delete_hub'
	| 'invite_to_hub'
	| 'kick_from_hub'
	| 'create_role'
	| 'update_role'
	| 'delete_role'
	| 'create_assignment'
	| 'delete_assignment'
	| 'create_space'
	| 'update_space'
	| 'delete_space'
	| 'create_entity'
	| 'create_policy'
	| 'delete_policy'
	| 'update_policy';

/**
 * Each <Vocab name="Policy" /> associates a <Vocab name="Role" /> with a name
 * to describe the Actions that <Vocab name="Actor" />s with the <Vocab name="Role" /> are able to perform.
 * Policies are often 1:1 with Actions, but they don't have to be.
 * `data` is a stub to support more complex governance schemes in the future.
 */
export interface Policy {
	policy_id: PolicyId;
	role_id: RoleId;
	name: PolicyName;
	data: {
		[k: string]: unknown;
	} | null;
	created: Date;
	updated: Date | null;
}
