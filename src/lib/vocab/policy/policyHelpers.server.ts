import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {Repos} from '$lib/db/Repos';
import {ApiError} from '$lib/server/api';
import {isActorAdmin} from '$lib/vocab/actor/actorHelpers.server';
import type {HubId} from '$lib/vocab/hub/hub';
import type {ActorId} from '$lib/vocab/actor/actor';
import type {EntityId} from '$lib/vocab/entity/entity';
import {HUB_COLUMNS} from '$lib/vocab/hub/hubHelpers.server';

const log = new Logger(gray('[') + blue('policyHelpers.server') + gray(']'));

export const checkPolicy = async (
	permission: string,
	actor_id: ActorId,
	hub_id: HubId,
	repos: Repos,
): Promise<void> => {
	log.debug('checking for policies with permission for actor in hub', permission, actor_id, hub_id);

	const policy = await repos.policy.filterByActorHubPermission(actor_id, hub_id, permission);

	if (policy.length === 0) {
		log.debug('no policy present for actor in hub', actor_id, hub_id);
		throw new ApiError(403, 'actor does not have permission');
	}
};

//TODO should we be bypassing policy system like this?
export const checkHubAccess = async (
	actor_id: ActorId,
	hub_id: HubId,
	repos: Repos,
): Promise<void> => {
	log.debug('checking for hub access for actor in hub', actor_id, hub_id);

	const inHub = await repos.assignment.isActorInHub(actor_id, hub_id);

	if (!inHub) {
		throw new ApiError(403, 'actor does not have permission');
	}
};

export const isCreateHubDisabled = async (repos: Repos): Promise<boolean> => {
	const hub = await repos.hub.loadAdminHub(HUB_COLUMNS.settings);
	if (hub) {
		return !!hub.settings.instance?.disableCreateHub;
	} else {
		//if we can't load the adminHub, we won't allow for new hubs to be created
		return true;
	}
};

export const checkEntityOwnership = async (
	actor_id: ActorId,
	entityIds: EntityId[],
	repos: Repos,
): Promise<void> => {
	if (await isActorAdmin(actor_id, repos)) {
		return;
	}

	const {entities, missing} = await repos.entity.filterByIds(entityIds);
	if (missing && missing.length > 0) {
		throw new ApiError(400, 'unable to process non-existing entities');
	}

	const spaceIds = Array.from(
		new Set(entities.map((e) => (e.actor_id === actor_id ? null! : e.space_id)).filter(Boolean)),
	);

	await Promise.all(
		spaceIds.map(async (space_id) => {
			const space = await repos.space.findById(space_id);
			//TODO hack in advance of space/entity policy checks
			if (!space) {
				throw new ApiError(404, 'no space found');
			}
			const common_aka_skipAuthorshipCheck =
				space.view.includes('<Todo') || space.view.includes('<List');
			if (!common_aka_skipAuthorshipCheck) {
				throw new ApiError(403, 'actor does not have permission');
			}
		}),
	);
};

export const checkEntityAccess = async (
	actor_id: number,
	entityIds: number[],
	repos: Repos,
): Promise<void> => {
	if (await isActorAdmin(actor_id, repos)) {
		return;
	}

	const spaces = await repos.space.filterByEntities(entityIds);
	const hubs = await repos.hub.filterByActor(actor_id, HUB_COLUMNS.hub_id);
	const joinedHubIds = hubs.map((h) => h.hub_id);

	for (const space of spaces) {
		if (!joinedHubIds.includes(space.hub_id)) {
			throw new ApiError(403, 'actor does not have permission');
		}
	}
};
