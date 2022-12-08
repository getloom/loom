import {OK, unwrap, type Result} from '@feltcoop/util';
import {Logger} from '@feltcoop/util/log.js';

import {blue, gray} from '$lib/server/colors';

import type {Repos} from '$lib/db/Repos';

const log = new Logger(gray('[') + blue('policyHelpers.server') + gray(']'));

export const checkPolicy = async (
	permission: string,
	actor_id: number,
	community_id: number,
	repos: Repos,
): Promise<Result<object, {message: string}>> => {
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
		return {ok: false, message: 'Provided actor does not have permission'};
	}
	return OK;
};
