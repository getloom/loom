import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

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
			const communityResult = await repos.community.findById(community_id);
			if (!communityResult.ok) {
				return {ok: false, status: 400, message: 'community not found'};
			}
			const community = communityResult.value;
			if (community.type === 'personal') {
				return {ok: false, status: 403, message: 'personal communities disallow memberships'};
			}

			// Check for duplicate memberships.
			const findMembershipResult = await repos.membership.findById(persona_id, community_id);
			if (findMembershipResult.ok) {
				return {ok: false, status: 409, message: 'membership already exists'};
			}

			// TODO test what happens if the persona doesn't exist

			const createMembershipResult = await repos.membership.create(persona_id, community_id);
			if (createMembershipResult.ok) {
				return {ok: true, status: 200, value: {membership: createMembershipResult.value}};
			}
			log.trace('[CreateMembership] error creating membership');
			return {ok: false, status: 500, message: 'error creating membership'};
		}),
};

//deletes a membership of a given persona in a given community
//TODO after front end data normalization make this use membership_id
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
			const personaResult = await repos.persona.findById(persona_id);
			const communityResult = await repos.community.findById(community_id);
			if (!personaResult.ok) {
				return {ok: false, status: 404, message: 'no persona found'};
			}
			if (!communityResult.ok) {
				return {ok: false, status: 404, message: 'no community found'};
			}
			if (communityResult.value.type === 'personal') {
				return {ok: false, status: 405, message: 'cannot leave a personal community'};
			}
			if (community_id === ADMIN_COMMUNITY_ID) {
				const adminMembershipsResult =
					await repos.membership.filterAccountPersonaMembershipsByCommunityId(community_id);
				if (!adminMembershipsResult.ok) {
					return {ok: false, status: 500, message: 'failed to lookup admin community memberships'};
				}
				if (adminMembershipsResult.value.length === 1) {
					return {ok: false, status: 405, message: 'cannot orphan the admin community'};
				}
			}
			if (
				personaResult.value.type === 'community' &&
				personaResult.value.community_id === community_id
			) {
				return {ok: false, status: 405, message: 'community persona cannot leave its community'};
			}

			const result = await repos.membership.deleteById(persona_id, community_id);
			log.trace('[DeleteMembership] result', result);
			if (!result.ok) {
				log.trace('[DeleteMembership] error removing membership: ', persona_id, community_id);
				return {ok: false, status: 500, message: 'failed to delete membership'};
			}
			await cleanOrphanCommunities(params.community_id, repos);
			return {ok: true, status: 200, value: null};
		}),
};

const cleanOrphanCommunities = async (community_id: number, repos: Repos) => {
	log.trace('[membershipServices] checking if community is orphaned', community_id);
	const result = await repos.membership.filterAccountPersonaMembershipsByCommunityId(community_id);
	if (result.ok && result.value.length <= 0) {
		log.trace('[membershipServices] no memberships found, cleaning up', community_id);
		const cleanupResult = await repos.community.deleteById(community_id);
		if (cleanupResult.ok) {
			log.trace('[membershipServices] orphan community successfully deleted', community_id);
		} else {
			log.trace('[membershipServices] issue deleting orphaned community', community_id);
		}
	}
};
