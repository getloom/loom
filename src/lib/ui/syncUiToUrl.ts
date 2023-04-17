import type {Readable, Writable} from '@feltcoop/svelte-gettable-stores';
import {browser} from '$app/environment';
import {goto} from '$app/navigation';
import {Logger} from '@feltjs/util/log.js';

import type {AccountActor, ActorId} from '$lib/vocab/actor/actor';
import {ACTOR_QUERY_KEY, toAppSearchParams} from '$lib/app/url';
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
		personaIndexSelection,
		hubSelection,
		spacesByHubId,
		spaceIdSelectionByHubId,
		sessionActors,
		entityById,
	} = ui;

	const rawPersonaIndex = url.searchParams.get(ACTOR_QUERY_KEY);
	const personaIndex = rawPersonaIndex ? Number(rawPersonaIndex) : null;
	const persona: Readable<AccountActor> | null =
		personaIndex === null ? null : sessionActors.get().value[personaIndex];
	if (!persona) {
		if (browser) {
			const fallbackPersonaIndex = 0;
			const targetUrl =
				url.pathname + '?' + toAppSearchParams(fallbackPersonaIndex + '', url.searchParams);
			if (targetUrl !== url.pathname + url.search) {
				log.warn(
					`failed to find persona at index ${personaIndex}; falling back to index ${fallbackPersonaIndex}`,
				);
				void goto(targetUrl, {replaceState: true});
				return; // exit early; this function re-runs from the `goto` call with the updated `$page`
			}
		}
	} else if (personaIndex !== personaIndexSelection.get()) {
		selectPersona(ui, persona.get().persona_id);
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

const selectPersona = ({personaIdSelection}: Ui, persona_id: ActorId): void => {
	// TODO could remove this typecase if `syncUiToUrl` is changed to be an event
	(personaIdSelection as Writable<ActorId | null>).set(persona_id);
};

const selectHub = (
	{personaIdSelection, hubIdSelectionByActorId}: Ui,
	hub_id: HubId | null,
): void => {
	const $personaIdSelection = personaIdSelection.get();
	if ($personaIdSelection) {
		hubIdSelectionByActorId.mutate(($c) => {
			$c.set($personaIdSelection, hub_id);
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
