// generated by src/lib/vocab/policy/policy.schema.ts

import type {Flavored} from '@feltjs/util';
import type {RoleId} from '$lib/vocab/role/role';

export type PolicyId = Flavored<number, 'PolicyId'>;

export type PolicyName =
	| 'Ephemera'
	| 'UpdateHub'
	| 'DeleteHub'
	| 'InviteToHub'
	| 'KickFromHub'
	| 'CreateRole'
	| 'UpdateRole'
	| 'DeleteRole'
	| 'CreateAssignment'
	| 'DeleteAssignment'
	| 'CreateSpace'
	| 'UpdateSpace'
	| 'DeleteSpace'
	| 'CreateEntity'
	| 'CreatePolicy'
	| 'DeletePolicy'
	| 'UpdatePolicy';

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

// generated by src/lib/vocab/policy/policy.schema.ts
