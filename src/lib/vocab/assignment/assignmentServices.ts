import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/actionTypes';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentActions';
import {ADMIN_HUB_ID} from '$lib/app/constants';
import type {ActionActor} from '$lib/vocab/actor/actor';
import {cleanOrphanHubs} from '$lib/vocab/hub/hubHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';
import {checkPolicy} from '$lib/vocab/policy/policyHelpers.server';
import {createAssignment} from '$lib/vocab/assignment/assignmentHelpers.server';

const log = new Logger(gray('[') + blue('assignmentServices') + gray(']'));

//Creates a new member relation for a hub
export const CreateAssignmentService: ServiceByName['CreateAssignment'] = {
	action: CreateAssignment,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, hub_id, actor_id, role_id} = params;
		log.debug('[CreateAssignment] creating assignment for persona & role', actor_id, role_id);
		log.debug('[CreateAssignment] checking policy', actor, hub_id);
		const hub = await repos.hub.findById(hub_id);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}
		await checkPolicy(permissions.CreateAssignment, actor, hub_id, repos);
		const assignment = await createAssignment(actor_id, hub, role_id, repos);
		log.debug('[CreateAssignment] new assignment created', assignment.assignment_id);
		return {ok: true, status: 200, value: {assignment}};
	},
};

/**
 * Deletes an assignment of a persona to a role in a hub.
 */
export const DeleteAssignmentService: ServiceByName['DeleteAssignment'] = {
	action: DeleteAssignment,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, assignment_id} = params;
		log.debug('[DeleteAssignment] deleting assignment ', assignment_id);
		const assignment = await repos.assignment.findById(assignment_id);
		if (!assignment) {
			return {ok: false, status: 404, message: 'no assignment found'};
		}
		const {persona_id, hub_id} = assignment;
		await checkPolicy(permissions.DeleteAssignment, actor, hub_id, repos);
		// TODO why can't this be parallelized? seems to be a bug in `postgres` but failed to reproduce in an isolated case
		// const [personaResult, hubResult] = await Promise.all([
		// 	repos.persona.findById(persona_id),
		// 	repos.hub.findById(hub_id),
		// ]);
		const persona = await repos.persona.findById<Pick<ActionActor, 'type' | 'hub_id'>>(persona_id, [
			'type',
			'hub_id',
		]);
		if (!persona) {
			return {ok: false, status: 404, message: 'no persona found'};
		}
		const hub = await repos.hub.findById(hub_id);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}
		if (hub.type === 'personal') {
			return {ok: false, status: 405, message: 'cannot leave a personal hub'};
		}
		if (hub_id === ADMIN_HUB_ID) {
			const adminAssignmentsCount = await repos.assignment.countAccountActorAssignmentsByHubId(
				hub_id,
			);
			if (adminAssignmentsCount === 1) {
				return {ok: false, status: 405, message: 'cannot orphan the admin hub'};
			}
		}
		if (persona.type === 'community' && persona.hub_id === hub_id) {
			return {ok: false, status: 405, message: 'hub persona cannot leave its hub'};
		}

		await repos.assignment.deleteById(assignment_id);

		await cleanOrphanHubs([hub_id], repos);

		return {ok: true, status: 200, value: null};
	},
};
