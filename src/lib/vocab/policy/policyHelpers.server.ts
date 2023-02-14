import {unwrap} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {Repos} from '$lib/db/Repos';
import type {ApiResult} from '$lib/server/api';
import {isPersonaAdmin} from '$lib/vocab/persona/personaHelpers.server';

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

export const isCreateCommunityDisabled = async (repos: Repos): Promise<boolean> => {
	const community = await repos.community.loadAdminCommunity();
	return !!community.settings.instance?.disableCreateCommunity;
};

export const checkEntityOwnership = async (
	actor_id: number,
	entityIds: number[],
	repos: Repos,
): Promise<ApiResult<undefined>> => {
	if (await isPersonaAdmin(actor_id, repos)) {
		return {ok: true, status: 200, value: undefined};
	}

	const {entities, missing} = unwrap(await repos.entity.filterByIds(entityIds));
	if (missing && missing.length > 0) {
		return {ok: false, status: 400, message: 'unable to process non-existing entities'};
	}

	const spaceIds = new Set(
		entities.map((e) => (e.persona_id === actor_id ? null! : e.space_id)).filter(Boolean),
	);

	for (const space_id of spaceIds) {
		// eslint-disable-next-line no-await-in-loop
		const space = unwrap(await repos.space.findById(space_id))!;
		//TODO hack in advance of space/entity policy checks
		const common_aka_skipAuthorshipCheck =
			space.view.includes('<Todo') || space.view.includes('<List');
		if (!common_aka_skipAuthorshipCheck) {
			return {ok: false, status: 403, message: 'actor does not have permission'};
		}
	}

	return {ok: true, status: 200, value: undefined};
};
