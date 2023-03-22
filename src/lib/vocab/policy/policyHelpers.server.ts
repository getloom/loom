import {unwrap} from '@feltjs/util';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {Repos} from '$lib/db/Repos';
import {ApiError} from '$lib/server/api';
import {isPersonaAdmin} from '$lib/vocab/actor/personaHelpers.server';

const log = new Logger(gray('[') + blue('policyHelpers.server') + gray(']'));

export const checkPolicy = async (
	permission: string,
	actor_id: number,
	hub_id: number,
	repos: Repos,
): Promise<void> => {
	log.trace('checking for policies with permission for actor in hub', permission, actor_id, hub_id);

	const policy = await repos.policy.filterByActorHubPermission(actor_id, hub_id, permission);

	if (policy.length === 0) {
		log.trace('no policy present for actor in hub', actor_id, hub_id);
		throw new ApiError(403, 'actor does not have permission');
	}
};

//TODO should we be bypassing policy system like this?
export const checkHubAccess = async (
	actor_id: number,
	hub_id: number,
	repos: Repos,
): Promise<void> => {
	log.trace('checking for hub access for actor in hub', actor_id, hub_id);

	const inHub = unwrap(await repos.assignment.isPersonaInHub(actor_id, hub_id));

	if (!inHub) {
		throw new ApiError(403, 'actor does not have permission');
	}
};

export const isCreateHubDisabled = async (repos: Repos): Promise<boolean> => {
	const hub = await repos.hub.loadAdminHub();
	if (hub) {
		return !!hub.settings.instance?.disableCreateHub;
	} else {
		//if we can't load the adminHub, we won't allow for new hubs to be created
		return true;
	}
};

export const checkEntityOwnership = async (
	actor_id: number,
	entityIds: number[],
	repos: Repos,
): Promise<void> => {
	if (await isPersonaAdmin(actor_id, repos)) {
		return;
	}

	const {entities, missing} = await repos.entity.filterByIds(entityIds);
	if (missing && missing.length > 0) {
		throw new ApiError(400, 'unable to process non-existing entities');
	}

	const spaceIds = new Set(
		entities.map((e) => (e.persona_id === actor_id ? null! : e.space_id)).filter(Boolean),
	);

	for (const space_id of spaceIds) {
		// eslint-disable-next-line no-await-in-loop
		const space = (await repos.space.findById(space_id))!;
		//TODO hack in advance of space/entity policy checks
		const common_aka_skipAuthorshipCheck =
			space.view.includes('<Todo') || space.view.includes('<List');
		if (!common_aka_skipAuthorshipCheck) {
			throw new ApiError(403, 'actor does not have permission');
		}
	}
};
