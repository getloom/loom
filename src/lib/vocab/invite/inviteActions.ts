import type {ServiceActionData} from '$lib/vocab/action/action.js';

export const CreateInvite: ServiceActionData = {
	type: 'ServiceAction',
	name: 'CreateInvite',
	authorize: false,
	params: {
		$id: '/schemas/CreateInviteParams',
		type: 'null',
	},
	response: {
		$id: '/schemas/CreateInviteResponse',
		type: 'object',
		properties: {
			invite: {
				$ref: '/schemas/Invite',
			},
		},
		required: ['invite'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateInviteResponseResult>',
	route: {
		path: '/api/v1/invites',
		method: 'POST',
	},
};
