import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {goto} from '$app/navigation';
import {get} from 'svelte/store';
import {page} from '$app/stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Community} from '$lib/vocab/community/community';
import {evictSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {evictAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import {toCommunityUrl} from '$lib/ui/url';
import {evictRoles} from '$lib/vocab/role/roleMutationHelpers';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {setIfUpdated} from '$lib/util/store';
import {isAccountPersona} from '../persona/personaHelpers';

export const stashCommunities = (
	ui: WritableUi,
	$communities: Community[],
	replace = false,
): void => {
	const {communityById, communities} = ui;
	if (replace) {
		communityById.clear();
		communities.mutate((c) => c.clear());
	}
	for (const $community of $communities) {
		stashCommunity(ui, $community);
	}
};

export const stashCommunity = (ui: WritableUi, $community: Community): Writable<Community> => {
	const {communityById, communities} = ui;

	let community = communityById.get($community.community_id);
	if (community) {
		setIfUpdated(community, $community);
	} else {
		community = writable($community);
		communityById.set($community.community_id, community);
		communities.mutate((c) => c.add(community!));
	}

	return community;
};

export const evictCommunity = (ui: WritableUi, community_id: number): void => {
	const {
		communityById,
		communitySelection,
		personaSelection,
		communities,
		communityIdSelectionByPersonaId,
		personaById,
		assignments,
		spacesByCommunityId,
		rolesByCommunityId,
	} = ui;

	const community = communityById.get(community_id);
	if (!community) return;
	const communityRoleIds = rolesByCommunityId.get().get(community_id);

	if (communityRoleIds) {
		evictRoles(
			ui,
			communityRoleIds.map((r) => r.get().role_id),
		);
	}

	if (communitySelection.get() === community) {
		const persona = personaSelection.get()!;
		ui.addMutationEffect(() =>
			goto(toCommunityUrl(persona.get().name, null, get(page).url.search), {
				replaceState: true,
			}),
		);
	}

	evictSpaces(ui, spacesByCommunityId.get().get(community_id)!);

	communityById.delete(community_id);

	communities.mutate((c) => c.delete(community));

	const $communityIdSelectionByPersonaId = communityIdSelectionByPersonaId.get().value;
	let mutated = false;
	for (const [persona_id, communityIdSelection] of $communityIdSelectionByPersonaId) {
		if (communityIdSelection !== community_id) continue;
		const persona = personaById.get(persona_id);
		const $persona = persona?.get();
		if (!isAccountPersona($persona)) continue; // TODO this check could be refactored, shouldn't be necessary here
		$communityIdSelectionByPersonaId.set(persona_id, $persona.community_id);
		mutated = true;
	}
	if (mutated) communityIdSelectionByPersonaId.mutate();

	// TODO could speed this up a cache of assignments by community, see in multiple places
	const assignmentsToEvict: Assignment[] = [];
	for (const a of assignments.get().value) {
		if (a.community_id === community_id) {
			assignmentsToEvict.push(a);
		}
	}
	evictAssignments(ui, assignmentsToEvict);
};
