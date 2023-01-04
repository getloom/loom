import {unwrap} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {Repos} from '$lib/db/Repos';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {ApiResult} from '$lib/server/api';
import type {Community} from '$lib/vocab/community/community';

const log = new Logger(gray('[') + blue('assignmentHelpers.server') + gray(']'));

export const createAssignment = async (
	persona_id: number,
	community: Community,
	role_id: number,
	repos: Repos,
): Promise<ApiResult<Assignment>> => {
	const {community_id} = community;
	log.trace('creating assingment for', persona_id, community_id, role_id);
	// Personal communities disallow assignments as a hard rule.
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
	return {ok: true, status: 200, value: assignment};
};
