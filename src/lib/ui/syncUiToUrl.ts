import type {Readable, Writable} from '@feltcoop/svelte-gettable-stores';
import {browser} from '$app/environment';
import {goto} from '$app/navigation';
import {Logger} from '@feltjs/util/log.js';

import type {AccountActor, ActorId} from '$lib/vocab/actor/actor';
import {ACTOR_QUERY_KEY, toAppSearchParams} from '$lib/util/url';
import type {Ui} from '$lib/ui/ui';
import {parseDirectoryPath} from '$lib/vocab/space/spaceHelpers';
import type {SpaceId} from '$lib/vocab/space/space';
import type {HubId} from '$lib/vocab/hub/hub';

const log = new Logger('[syncUiToUrl]');

// TODO instead doing a `select` action on startup, initialize with correct values

export const syncUiToUrl = (ui: Ui, params: {hub?: string; space?: string}, url: URL): void => {
	if (!params.hub) return;

	const {
		hubs,
		actorIndexSelection,
		hubSelection,
		spacesByHubId,
		spaceIdSelectionByHubId,
		sessionActors,
		entityById,
	} = ui;

	const rawActorIndex = url.searchParams.get(ACTOR_QUERY_KEY);
	const actorIndex = rawActorIndex ? Number(rawActorIndex) : null;
	const actor: Readable<AccountActor> | null =
		actorIndex === null ? null : sessionActors.get().value[actorIndex];
	if (!actor) {
		if (browser) {
			const fallbackActorIndex = 0;
			const targetUrl =
				url.pathname + '?' + toAppSearchParams(fallbackActorIndex + '', url.searchParams);
			if (targetUrl !== url.pathname + url.search) {
				log.warn(
					`failed to find actor at index ${actorIndex}; falling back to index ${fallbackActorIndex}`,
				);
				void goto(targetUrl, {replaceState: true});
				return; // exit early; this function re-runs from the `goto` call with the updated `$page`
			}
		}
	} else if (actorIndex !== actorIndexSelection.get()) {
		selectActor(ui, actor.get().actor_id);
	} // else already selected

	// TODO speed this up with a map of hubByName
	const hub = Array.from(hubs.get().value).find((c) => c.get().name === params.hub);
	if (!hub) {
		// occurs when routing to an inaccessible or nonexistent hub
		selectHub(ui, null);
		return;
	}
	const {hub_id} = hub.get();
	if (hub !== hubSelection.get()) {
		selectHub(ui, hub_id);
	}

	const spacePath = '/' + (params.space || '');
	//TODO lookup space by hub_id+path (see this comment in multiple places)
	const space = spacesByHubId
		.get()
		.get(hub_id)!
		.find(
			(s) => entityById.get(s.get().directory_id)!.get().path === parseDirectoryPath(spacePath), // `/home` falls back to `/`
		);
	if (!space) {
		// occurs when routing to an inaccessible or nonexistent space
		selectSpace(ui, hub_id, null);
		return;
	}
	const selectedSpaceId = spaceIdSelectionByHubId.get().value.get(hub_id);
	const {space_id} = space.get();
	if (space_id !== selectedSpaceId) {
		selectSpace(ui, hub_id, space_id);
	}
};

const selectActor = ({actorIdSelection}: Ui, actor_id: ActorId): void => {
	// TODO could remove this typecast if `syncUiToUrl` is changed to be an action
	(actorIdSelection as Writable<ActorId | null>).set(actor_id);
};

const selectHub = ({actorIdSelection, hubIdSelectionByActorId}: Ui, hub_id: HubId | null): void => {
	const $actorIdSelection = actorIdSelection.get();
	if ($actorIdSelection) {
		hubIdSelectionByActorId.mutate(($c) => {
			$c.set($actorIdSelection, hub_id);
		});
	}
};

const selectSpace = (
	{spaceIdSelectionByHubId}: Ui,
	hub_id: HubId,
	space_id: SpaceId | null,
): void => {
	spaceIdSelectionByHubId.mutate(($s) => {
		$s.set(hub_id, space_id);
	});
};
