import {Logger} from '@feltjs/util/log.js';
import {unwrap} from '@feltjs/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentEvents';
import {ADMIN_COMMUNITY_ID} from '$lib/app/constants';
import type {ActorPersona} from '$lib/vocab/persona/persona';
import {cleanOrphanCommunities} from '$lib/vocab/community/communityHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';
import {checkPolicy} from '$lib/vocab/policy/policyHelpers.server';
import {createAssignment} from '$lib/vocab/assignment/assignmentHelpers.server';

const log = new Logger(gray('[') + blue('assignmentServices') + gray(']'));

//Creates a new member relation for a community
export const CreateAssignmentService: ServiceByName['CreateAssignment'] = {
	event: CreateAssignment,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, community_id, persona_id, role_id} = params;
			log.trace('[CreateAssignment] creating assignment for persona & role', persona_id, role_id);
			log.trace('[CreateAssignment] checking policy', actor, community_id);
			const community = unwrap(await repos.community.findById(community_id));
			if (!community) {
				return {ok: false, status: 404, message: 'no community found'};
			}
			unwrap(await checkPolicy(permissions.CreateAssignment, actor, community_id, repos));
			const assignment = unwrap(await createAssignment(persona_id, community, role_id, repos));
			log.trace('[CreateAssignment] new assignment created', assignment.assignment_id);
			return {ok: true, status: 200, value: {assignment}};
		}),
};

/**
 * Deletes an assignment of a persona to a role in a community.
 */
export const DeleteAssignmentService: ServiceByName['DeleteAssignment'] = {
	event: DeleteAssignment,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, assignment_id} = params;
			log.trace('[DeleteAssignment] deleting assignment ', assignment_id);
			const assignment = unwrap(await repos.assignment.findById(assignment_id));
			if (!assignment) {
				return {ok: false, status: 404, message: 'no assignment found'};
			}
			const {persona_id, community_id} = assignment;
			unwrap(await checkPolicy(permissions.DeleteAssignment, actor, community_id, repos));
			// TODO why can't this be parallelized? seems to be a bug in `postgres` but failed to reproduce in an isolated case
			// const [personaResult, communityResult] = await Promise.all([
			// 	repos.persona.findById(persona_id),
			// 	repos.community.findById(community_id),
			// ]);
			const persona = unwrap(
				await repos.persona.findById<Pick<ActorPersona, 'type' | 'community_id'>>(persona_id, [
					'type',
					'community_id',
				]),
			);
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
				const adminAssignmentsCount = unwrap(
					await repos.assignment.countAccountPersonaAssignmentsByCommunityId(community_id),
				);
				if (adminAssignmentsCount === 1) {
					return {ok: false, status: 405, message: 'cannot orphan the admin community'};
				}
			}
			if (persona.type === 'community' && persona.community_id === community_id) {
				return {ok: false, status: 405, message: 'community persona cannot leave its community'};
			}

			unwrap(await repos.assignment.deleteById(assignment_id));

			unwrap(await cleanOrphanCommunities([community_id], repos));

			return {ok: true, status: 200, value: null};
		}),
};
