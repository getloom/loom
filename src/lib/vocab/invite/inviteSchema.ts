import type {Json_Schema} from '$lib/util/schema.js';

export const InviteIdSchema = {
	$id: '/schemas/InviteId',
	type: 'number',
	tsType: "Flavored<number, 'InviteId'>",
	tsImport: "import {Flavored} from '@ryanatkn/belt/types.js'",
} satisfies Json_Schema;

export const InviteSchema = {
	$id: '/schemas/Invite',
	type: 'object',
	description: `
    Represents an invitation from one account to another for closed instances.
	`,
	properties: {
		invite_id: {$ref: '/schemas/InviteId'},
		code: {type: 'string'},
		status: {type: 'string'},
		from_id: {$ref: '/schemas/AccountId'},
		to_id: {anyOf: [{$ref: '/schemas/AccountId'}, {type: 'null'}]},
		created: {type: 'object', instanceof: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date'}, {type: 'null'}]},
	},
	required: ['account_id', 'name', 'settings', 'password', 'created', 'updated'],
	additionalProperties: false,
} satisfies Json_Schema;
