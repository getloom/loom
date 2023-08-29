import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/vocab/action/actionTypes';
import {CreateAssignment, DeleteAssignment} from '$lib/vocab/assignment/assignmentActions';
import {ADMIN_HUB_ID} from '$lib/util/constants';
import {HUB_COLUMNS, cleanOrphanHubs} from '$lib/vocab/hub/hubHelpers.server';
import {createAssignment} from '$lib/vocab/assignment/assignmentHelpers.server';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

const log = new Logger(gray('[') + blue('assignmentServices') + gray(']'));

//Creates a new member relation for a hub
export const CreateAssignmentService: ServiceByName['CreateAssignment'] = {
	action: CreateAssignment,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {actor, hub_id, actor_id, role_id} = params;
		log.debug('[CreateAssignment] creating assignment for actor & role', actor_id, role_id);
		log.debug('[CreateAssignment] checking policy', actor, hub_id);
		const hub = await repos.hub.findById(hub_id, HUB_COLUMNS.hub_id_type);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}
		await checkPolicy('create_assignment', hub_id);
		const assignment = await createAssignment(repos, actor_id, hub, role_id);
		log.debug('[CreateAssignment] new assignment created', assignment.assignment_id);
		return {ok: true, status: 200, value: {assignment}, broadcast: hub_id};
	},
};

/**
 * Deletes an assignment of a actor to a role in a hub.
 */
export const DeleteAssignmentService: ServiceByName['DeleteAssignment'] = {
	action: DeleteAssignment,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {assignment_id} = params;
		log.debug('[DeleteAssignment] deleting assignment ', assignment_id);
		const assignment = await repos.assignment.findById(assignment_id);
		if (!assignment) {
			return {ok: false, status: 404, message: 'no assignment found'};
		}
		const {actor_id, hub_id} = assignment;
		await checkPolicy('delete_assignment', hub_id);
		// TODO why can't this be parallelized? seems to be a bug in `postgres` but failed to reproduce in an isolated case
		// const [actorResult, hubResult] = await Promise.all([
		// 	repos.actor.findById(actor_id),
		// 	repos.hub.findById(hub_id),
		// ]);
		const actorData = await repos.actor.findById(actor_id, ACTOR_COLUMNS.type_hub_id);
		if (!actorData) {
			return {ok: false, status: 404, message: 'no actor found'};
		}
		const hub = await repos.hub.findById(hub_id, HUB_COLUMNS.type);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}
		if (hub.type === 'personal') {
			return {ok: false, status: 405, message: 'cannot leave a personal hub'};
		}
		if (hub_id === ADMIN_HUB_ID) {
			const adminAssignmentsCount = await repos.assignment.countAccountActorAssignmentsByHub(
				hub_id,
			);
			if (adminAssignmentsCount === 1) {
				return {ok: false, status: 405, message: 'cannot orphan the admin hub'};
			}
		}
		if (actorData.type === 'community' && actorData.hub_id === hub_id) {
			return {ok: false, status: 405, message: 'hub actor cannot leave its hub'};
		}

		await repos.assignment.deleteById(assignment_id);

		await cleanOrphanHubs(repos, [hub_id]);

		return {ok: true, status: 200, value: null, broadcast: hub_id};
	},
};
