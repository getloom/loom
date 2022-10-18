export const MembershipSchema = {
	$id: '/schemas/Membership.json',
	type: 'object',
	properties: {
		membership_id: {type: 'number'},
		persona_id: {type: 'number'},
		community_id: {type: 'number'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
	},
	required: ['membership_id', 'persona_id', 'community_id', 'created'],
	additionalProperties: false,
};
