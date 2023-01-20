import {unwrap} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {Repos} from '$lib/db/Repos';
import type {ApiResult} from '$lib/server/api';

const log = new Logger(gray('[') + blue('policyHelpers.server') + gray(']'));

export const checkPolicy = async (
	permission: string,
	actor_id: number,
	community_id: number,
	repos: Repos,
): Promise<ApiResult<undefined>> => {
	log.trace(
		'checking for policies with permission for actor in community',
		permission,
		actor_id,
		community_id,
	);

	const policy = unwrap(
		await repos.policy.filterByActorCommunityPermission(actor_id, community_id, permission),
	);

	if (policy.length === 0) {
		log.trace('no policy present for actor in community', actor_id, community_id);
		return {ok: false, status: 403, message: 'actor does not have permission'};
	}
	return {ok: true, status: 200, value: undefined};
};

//TODO should we be bypassing policy system like this?
export const checkCommunityAccess = async (
	actor_id: number,
	community_id: number,
	repos: Repos,
): Promise<ApiResult<undefined>> => {
	log.trace('checking for community access for actor in community', actor_id, community_id);

	const inCommunity = unwrap(await repos.assignment.isPersonaInCommunity(actor_id, community_id));

	if (inCommunity) {
		return {ok: true, status: 200, value: undefined};
	} else {
		return {ok: false, status: 403, message: 'actor does not have permission'};
	}
};
