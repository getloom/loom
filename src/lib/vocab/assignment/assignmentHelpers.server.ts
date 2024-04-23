import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import type {Repos} from '$lib/db/Repos.js';
import type {Assignment} from '$lib/vocab/assignment/assignment.js';
import {ApiError} from '$lib/server/api.js';
import type {Hub} from '$lib/vocab/hub/hub.js';
import type {ActorId} from '$lib/vocab/actor/actor.js';
import type {RoleId} from '$lib/vocab/role/role.js';

const log = new Logger(gray('[') + blue('assignmentHelpers.server') + gray(']'));

export const createAssignment = async (
	repos: Repos,
	actor_id: ActorId,
	hub: Pick<Hub, 'hub_id' | 'type'>,
	role_id: RoleId,
): Promise<Assignment> => {
	const {hub_id} = hub;
	log.debug('creating assingment for', actor_id, hub_id, role_id);
	// Personal hubs disallow assignments as a hard rule.
	if (hub.type === 'personal') {
		throw new ApiError(403, 'personal hubs disallow additional assignments');
	}

	// Check for duplicate assignments.
	const existingAssignment = await repos.assignment.findByUniqueIds(actor_id, hub_id, role_id);
	if (existingAssignment) {
		throw new ApiError(409, 'assignment already exists');
	}

	// TODO test what happens if the actor doesn't exist

	const assignment = await repos.assignment.create(actor_id, hub_id, role_id);
	return assignment;
};
