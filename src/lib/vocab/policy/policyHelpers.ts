import type {PolicyName} from '$lib/vocab/policy/policy';

// These are defined here for convenient usage as data.
// They're circularly used in the `PolicyNameSchema` to generate the `PolicyName` type.
export const policyNames: PolicyName[] = [
	'Ephemera',
	'UpdateHub',
	'DeleteHub',
	'InviteToHub',
	'KickFromHub',
	'CreateRole',
	'UpdateRole',
	'DeleteRole',
	'CreateAssignment',
	'DeleteAssignment',
	'CreateSpace',
	'UpdateSpace',
	'DeleteSpace',
	'CreateEntity',
	'CreatePolicy',
	'DeletePolicy',
	'UpdatePolicy',
];
