import type {Readable, Writable} from '@feltcoop/svelte-gettable-stores';
import {browser} from '$app/environment';
import {goto} from '$app/navigation';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {AccountPersona} from '$lib/vocab/persona/persona';
import {PERSONA_QUERY_KEY, toSearchParams} from '$lib/ui/url';
import type {Ui} from '$lib/ui/ui';

const log = new Logger('[syncUiToUrl]');

// TODO instead of dispatching `select` events on startup, initialize with correct values

export const syncUiToUrl = (
	ui: Ui,
	params: {community?: string; space?: string},
	url: URL,
): void => {
	if (!params.community) return;

	const {
		communities,
		personaIndexSelection,
		communitySelection,
		spacesByCommunityId,
		spaceIdSelectionByCommunityId,
		sessionPersonas,
	} = ui;

	const rawPersonaIndex = url.searchParams.get(PERSONA_QUERY_KEY);
	const personaIndex = rawPersonaIndex ? Number(rawPersonaIndex) : null;
	const persona: Readable<AccountPersona> | null =
		personaIndex === null ? null : sessionPersonas.get().value[personaIndex];
	if (!persona) {
		if (browser) {
			const fallbackPersonaIndex = 0;
			const targetUrl =
				url.pathname + '?' + toSearchParams(url.searchParams, {persona: fallbackPersonaIndex + ''});
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

	// TODO speed this up with a map of communityByName
	const community = communities.get().value.find((c) => c.get().name === params.community);
	if (!community) {
		// occurs when routing to an inaccessible or nonexistent community
		selectCommunity(ui, null);
		return;
	}
	const {community_id} = community.get();
	if (community !== communitySelection.get()) {
		selectCommunity(ui, community_id);
	}

	const spaceUrl = '/' + (params.space || '');
	//TODO lookup space by community_id+url (see this comment in multiple places)
	const space = spacesByCommunityId
		.get()
		.get(community_id)!
		.find((s) => s.get().url === spaceUrl);
	if (!space) {
		// occurs when routing to an inaccessible or nonexistent space
		selectSpace(ui, community_id, null);
		return;
	}
	const selectedSpaceId = spaceIdSelectionByCommunityId.get().value.get(community_id);
	const {space_id} = space.get();
	if (space_id !== selectedSpaceId) {
		selectSpace(ui, community_id, space_id);
	}
};

const selectPersona = ({personaIdSelection}: Ui, persona_id: number): void => {
	// TODO could remove this typecase if `syncUiToUrl` is changed to be an event
	(personaIdSelection as Writable<number | null>).set(persona_id);
};

const selectCommunity = (
	{personaIdSelection, communityIdSelectionByPersonaId}: Ui,
	community_id: number | null,
): void => {
	const $personaIdSelection = personaIdSelection.get();
	if ($personaIdSelection) {
		communityIdSelectionByPersonaId.mutate(($c) => {
			$c.set($personaIdSelection, community_id);
		});
	}
};

const selectSpace = (
	{spaceIdSelectionByCommunityId}: Ui,
	community_id: number,
	space_id: number | null,
): void => {
	spaceIdSelectionByCommunityId.mutate(($s) => {
		$s.set(community_id, space_id);
	});
};
