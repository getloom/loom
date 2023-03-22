import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {Repos} from '$lib/db/Repos';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {ApiError} from '$lib/server/api';
import type {Hub} from '$lib/vocab/hub/hub';

const log = new Logger(gray('[') + blue('assignmentHelpers.server') + gray(']'));

export const createAssignment = async (
	persona_id: number,
	hub: Hub,
	role_id: number,
	repos: Repos,
): Promise<Assignment> => {
	const {hub_id} = hub;
	log.trace('creating assingment for', persona_id, hub_id, role_id);
	// Personal hubs disallow assignments as a hard rule.
	if (hub.type === 'personal') {
		throw new ApiError(403, 'personal hubs disallow additional assignments');
	}

	// Check for duplicate assignments.
	const existingAssignment = await repos.assignment.findByUniqueIds(persona_id, hub_id, role_id);
	if (existingAssignment) {
		throw new ApiError(409, 'assignment already exists');
	}

	// TODO test what happens if the persona doesn't exist

	const assignment = await repos.assignment.create(persona_id, hub_id, role_id);
	return assignment;
};
