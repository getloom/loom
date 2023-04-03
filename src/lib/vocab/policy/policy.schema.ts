export const PolicyIdSchema = {
	$id: '/schemas/PolicyId.json',
	type: 'number',
	tsType: "Flavored<number, 'PolicyId'>",
	tsImport: "import {Flavored} from '@feltjs/util';",
};

export const PolicySchema = {
	$id: '/schemas/Policy.json',
	type: 'object',
	description: `
		Policies are associated with Roles to describe the actions a Role is able to take with the system.
		Permissions are the enumeration of the those actions, often 1:1 with system Events.
		Data is a currently-unused attribute earmarked for allowing for more complicated governance schemes.
	`,
	properties: {
		policy_id: {type: 'number', tsType: 'PolicyId'},
		role_id: {
			type: 'number',
			tsType: 'RoleId',
			tsImport: "import type {RoleId} from '$lib/vocab/role/role'",
		},
		permission: {type: 'string'},
		data: {anyOf: [{type: 'object'}, {type: 'null'}]},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['policy_id', 'role_id', 'permission', 'data', 'created', 'updated'],
	additionalProperties: false,
};
