import type {Writable} from '@feltcoop/svelte-gettable-stores';

import type {ActorId} from '$lib/vocab/actor/actor.js';
import {ACTOR_QUERY_KEY} from '$lib/util/url.js';
import type {Ui} from '$lib/ui/ui.js';
import {parseDirectoryPath} from '$lib/vocab/space/spaceHelpers.js';
import type {SpaceId} from '$lib/vocab/space/space.js';
import type {HubId} from '$lib/vocab/hub/hub.js';

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

	const actorIndex = Number(url.searchParams.get(ACTOR_QUERY_KEY)) || 0;
	// TODO now assuming it may be missing, but is this right?
	// old comment: should we handle missing actors differently than just falling back to the first? maybe redirect?
	const actor = sessionActors.get().value.length
		? sessionActors.get().value[actorIndex] || sessionActors.get().value[0]
		: null;

	if (actor && actorIndex !== actorIndexSelection.get()) {
		selectActor(ui, actor.get().actor_id);
	} // else already selected
	// TODO what about when `!actor`?

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
