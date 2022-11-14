import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {goto} from '$app/navigation';
import {removeUnordered} from '@feltcoop/felt/util/array.js';
import {get} from 'svelte/store';
import {page} from '$app/stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Community} from '$lib/vocab/community/community';
import {evictSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {evictAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import {toCommunityUrl} from '$lib/ui/url';
import {Mutated} from '$lib/util/Mutated';
import {evictRoles} from '$lib/vocab/role/roleMutationHelpers';
import type {AccountPersona} from '$lib/vocab/persona/persona';
import type {Assignment} from '$lib/vocab/assignment/assignment';

export const stashCommunities = (
	ui: WritableUi,
	$communities: Community[],
	mutated = new Mutated('stashCommunities'),
	replace = false,
): void => {
	const {communityById, communities} = ui;
	if (replace) {
		communityById.clear();
		communities.get().value.length = 0;
		mutated.add(communities);
	}
	for (const $community of $communities) {
		stashCommunity(ui, $community, mutated);
	}
	mutated.end('stashCommunities');
};

export const stashCommunity = (
	ui: WritableUi,
	$community: Community,
	mutated = new Mutated('stashCommunity'),
): Writable<Community> => {
	const {communityById, communities} = ui;

	let community = communityById.get($community.community_id);
	if (community) {
		community.set($community);
	} else {
		community = writable($community);
		communityById.set($community.community_id, community);
		communities.get().value.push(community);
		mutated.add(communities);
	}

	mutated.end('stashCommunity');
	return community;
};

export const evictCommunity = async (
	ui: WritableUi,
	community_id: number,
	mutated = new Mutated('evictCommunity'),
): Promise<void> => {
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
			mutated,
		);
	}

	if (communitySelection.get() === community) {
		const persona = personaSelection.get()!;
		await goto(toCommunityUrl(persona.get().name, null, get(page).url.search), {
			replaceState: true,
		});
	}

	await evictSpaces(ui, spacesByCommunityId.get().get(community_id)!, mutated);

	communityById.delete(community_id);

	removeUnordered(communities.get().value, communities.get().value.indexOf(community));
	mutated.add(communities);

	for (const [persona_id, communityIdSelection] of communityIdSelectionByPersonaId.get().value) {
		if (communityIdSelection === community_id) {
			communityIdSelectionByPersonaId
				.get()
				.value.set(persona_id, (personaById.get(persona_id)!.get() as AccountPersona).community_id);
			mutated.add(communityIdSelectionByPersonaId);
		}
	}

	// TODO could speed this up a cache of assignments by community, see in multiple places
	const assignmentsToEvict: Assignment[] = [];
	for (const a of assignments.get().value) {
		if (a.community_id === community_id) {
			assignmentsToEvict.push(a);
		}
	}
	await evictAssignments(ui, assignmentsToEvict, mutated);

	mutated.end('evictCommunity');
};
