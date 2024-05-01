import type {Json_Schema} from '$lib/util/schema.js';

import {policyNames} from '$lib/vocab/policy/policyHelpers.js';

export const PolicyIdSchema = {
	$id: '/schemas/PolicyId',
	type: 'number',
	tsType: "Flavored<number, 'PolicyId'>",
	tsImport: "import {Flavored} from '@ryanatkn/belt/types.js'",
} satisfies Json_Schema;

export const PolicySchema = {
	$id: '/schemas/Policy',
	type: 'object',
	description: `
		Each <Vocab name="Policy" /> associates a <Vocab name="Role" /> with a name
		to describe the Actions that <Vocab name="Actor" />s with the <Vocab name="Role" /> are able to perform.
		Policies are often 1:1 with Actions, but they don't have to be.
		\`data\` is a stub to support more complex governance schemes in the future.
	`,
	properties: {
		policy_id: {$ref: '/schemas/PolicyId'},
		role_id: {$ref: '/schemas/RoleId'},
		name: {$ref: '/schemas/PolicyName'},
		data: {anyOf: [{type: 'object'}, {type: 'null'}]},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['policy_id', 'role_id', 'name', 'data', 'created', 'updated'],
	additionalProperties: false,
} satisfies Json_Schema;

export const PolicyNameSchema = {
	$id: '/schemas/PolicyName',
	type: 'string',
	enum: policyNames,
} satisfies Json_Schema;
