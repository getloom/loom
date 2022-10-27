import {Logger} from '@feltcoop/felt/util/log.js';
import {OK, unwrap, type Result} from '@feltcoop/felt';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentEvents';
import {ADMIN_COMMUNITY_ID} from '$lib/app/admin';
import type {Repos} from '$lib/db/Repos';

const log = new Logger(gray('[') + blue('assignmentServices') + gray(']'));

//Creates a new member relation for a community
export const CreateAssignmentService: ServiceByName['CreateAssignment'] = {
	event: CreateAssignment,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {community_id, persona_id, role_id} = params;
			log.trace('[CreateAssignment] creating assignment', persona_id, community_id);

			// Personal communities disallow assignments as a hard rule.
			const community = unwrap(await repos.community.findById(community_id));
			if (!community) {
				return {ok: false, status: 400, message: 'community not found'};
			}
			if (community.type === 'personal') {
				return {
					ok: false,
					status: 403,
					message: 'personal communities disallow additional assignments',
				};
			}

			// Check for duplicate assignments.
			const existingAssignment = unwrap(
				await repos.assignment.findByUniqueIds(persona_id, community_id, role_id),
			);
			if (existingAssignment) {
				return {ok: false, status: 409, message: 'assignment already exists'};
			}

			// TODO test what happens if the persona doesn't exist

			const assignment = unwrap(await repos.assignment.create(persona_id, community_id, role_id));
			return {ok: true, status: 200, value: {assignment}};
		}),
};

//deletes an assignment of a given persona in a given community
//TODO after front end data normalization make this use assignment_id
//TODO refactor this to use assignment_id instead
export const DeleteAssignmentService: ServiceByName['DeleteAssignment'] = {
	event: DeleteAssignment,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {persona_id, community_id} = params;
			log.trace(
				'[DeleteAssignment] deleting assignment for persona in community',
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
				const adminAssignments = unwrap(
					await repos.assignment.filterAccountPersonaAssignmentsByCommunityId(community_id),
				);
				if (adminAssignments.length === 1) {
					return {ok: false, status: 405, message: 'cannot orphan the admin community'};
				}
			}
			if (persona.type === 'community' && persona.community_id === community_id) {
				return {ok: false, status: 405, message: 'community persona cannot leave its community'};
			}

			//TODO replace with deleteById
			unwrap(await repos.assignment.deleteByCommunity(persona_id, community_id));

			unwrap(await cleanOrphanCommunities(params.community_id, repos));

			return {ok: true, status: 200, value: null};
		}),
};

export const cleanOrphanCommunities = async (
	community_id: number,
	repos: Repos,
): Promise<Result> => {
	log.trace('[assignmentServices] checking if community is orphaned', community_id);
	const accountPersonaAssignments = unwrap(
		await repos.assignment.filterAccountPersonaAssignmentsByCommunityId(community_id),
	);
	if (accountPersonaAssignments.length === 0) {
		log.trace('[assignmentServices] no assignments found for community, cleaning up', community_id);
		unwrap(await repos.community.deleteById(community_id));
	}
	return OK;
};
