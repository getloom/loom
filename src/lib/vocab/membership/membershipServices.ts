import {Logger} from '@feltcoop/felt/util/log.js';
import {OK, unwrap, type Result} from '@feltcoop/felt';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateMembership, DeleteMembership} from '$lib/vocab/membership/membershipEvents';
import {ADMIN_COMMUNITY_ID} from '$lib/app/admin';
import type {Repos} from '$lib/db/Repos';

const log = new Logger(gray('[') + blue('membershipServices') + gray(']'));

//Creates a new member relation for a community
export const CreateMembershipService: ServiceByName['CreateMembership'] = {
	event: CreateMembership,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {community_id, persona_id} = params;
			log.trace('[CreateMembership] creating membership', persona_id, community_id);

			// Personal communities disallow memberships as a hard rule.
			const community = unwrap(await repos.community.findById(community_id));
			if (!community) {
				return {ok: false, status: 400, message: 'community not found'};
			}
			if (community.type === 'personal') {
				return {ok: false, status: 403, message: 'personal communities disallow memberships'};
			}

			// Check for duplicate memberships.
			const existingMembership = unwrap(await repos.membership.findById(persona_id, community_id));
			if (existingMembership) {
				return {ok: false, status: 409, message: 'membership already exists'};
			}

			// TODO test what happens if the persona doesn't exist

			const membership = unwrap(await repos.membership.create(persona_id, community_id));
			return {ok: true, status: 200, value: {membership}};
		}),
};

//deletes a membership of a given persona in a given community
//TODO after front end data normalization make this use membership_id
//TODO refactor this to use membership_id instead
export const DeleteMembershipService: ServiceByName['DeleteMembership'] = {
	event: DeleteMembership,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {persona_id, community_id} = params;
			log.trace(
				'[DeleteMembership] deleting membership for persona in community',
				persona_id,
				community_id,
			);
			// TODO why can't this be parallelized? bug in our code? or the driver? failed to reproduce in the driver.
			// const [personaResult, communityResult] = await Promise.all([
			// 	repos.persona.findById(persona_id),
			// 	repos.community.findById(community_id),
			// ]);
			const persona = unwrap(await repos.persona.findById(persona_id));
			if (!persona) {
				return {ok: false, status: 404, message: 'no persona found'};
			}
			const community = unwrap(await repos.community.findById(community_id));
			if (!community) {
				return {ok: false, status: 404, message: 'no community found'};
			}
			if (community.type === 'personal') {
				return {ok: false, status: 405, message: 'cannot leave a personal community'};
			}
			if (community_id === ADMIN_COMMUNITY_ID) {
				const adminMemberships = unwrap(
					await repos.membership.filterAccountPersonaMembershipsByCommunityId(community_id),
				);
				if (adminMemberships.length === 1) {
					return {ok: false, status: 405, message: 'cannot orphan the admin community'};
				}
			}
			if (persona.type === 'community' && persona.community_id === community_id) {
				return {ok: false, status: 405, message: 'community persona cannot leave its community'};
			}

			//TODO replace with deleteById
			unwrap(await repos.membership.deleteByCommunity(persona_id, community_id));

			unwrap(await cleanOrphanCommunities(params.community_id, repos));

			return {ok: true, status: 200, value: null};
		}),
};

export const cleanOrphanCommunities = async (
	community_id: number,
	repos: Repos,
): Promise<Result> => {
	log.trace('[membershipServices] checking if community is orphaned', community_id);
	const accountPersonaMemberships = unwrap(
		await repos.membership.filterAccountPersonaMembershipsByCommunityId(community_id),
	);
	if (accountPersonaMemberships.length === 0) {
		log.trace('[membershipServices] no memberships found for community, cleaning up', community_id);
		unwrap(await repos.community.deleteById(community_id));
	}
	return OK;
};
