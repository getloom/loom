export const MembershipSchema = {
	$id: '/schemas/Membership.json',
	type: 'object',
	properties: {
		persona_id: {type: 'number'},
		community_id: {type: 'number'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
	},
	required: ['persona_id', 'community_id', 'created'],
	additionalProperties: false,
};
