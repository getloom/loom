export const RoleSchema = {
	$id: '/schemas/Role.json',
	type: 'object',
	description: `
		Roles are user-defined governance objects that exist within the context of a single Hub.
		They have Policies associated with them that allow for actions to be taken within the system.
		When a Persona has a Role via an Assignment, that actor may take any action allowed by the Role's Policies.
	`,
	properties: {
		role_id: {type: 'number'},
		hub_id: {type: 'number'},
		name: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['role_id', 'hub_id', 'name', 'created', 'updated'],
	additionalProperties: false,
};
