import type {VocabSchema} from '@feltjs/gro';

export const PolicyIdSchema = {
	$id: '/schemas/PolicyId',
	type: 'number',
	tsType: "Flavored<number, 'PolicyId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
} satisfies VocabSchema;

export const PolicySchema = {
	$id: '/schemas/Policy',
	type: 'object',
	description: `
		Policies are associated with Roles to describe the system Actions a Role is able to take in the system.
		Permissions are the enumeration of the those Actions and are often 1:1.
		\`data\` is a currently-unused attribute earmarked for allowing for more complicated governance schemes.
	`,
	properties: {
		policy_id: {$ref: '/schemas/PolicyId'},
		role_id: {$ref: '/schemas/RoleId'},
		permission: {type: 'string'},
		data: {anyOf: [{type: 'object'}, {type: 'null'}]},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['policy_id', 'role_id', 'permission', 'data', 'created', 'updated'],
	additionalProperties: false,
} satisfies VocabSchema;
