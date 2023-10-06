import type {PolicyName} from '$lib/vocab/policy/policy.js';

// These are defined here for convenient usage as data.
// They're circularly used in the `PolicyNameSchema` to generate the `PolicyName` type.
export const policyNames: PolicyName[] = [
	'ephemera',
	'update_hub',
	'delete_hub',
	'invite_to_hub',
	'kick_from_hub',
	'create_role',
	'update_role',
	'delete_role',
	'create_assignment',
	'delete_assignment',
	'create_space',
	'update_space',
	'delete_space',
	'create_entity',
	'create_policy',
	'delete_policy',
	'update_policy',
];
