import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {goto} from '$app/navigation';
import {removeUnordered} from '@feltcoop/felt/util/array.js';

import type {WritableUi} from '$lib/ui/ui';
import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Membership} from '$lib/vocab//membership/membership';
import {upsertSpaces} from '$lib/vocab/space/spaceMutationHelpers';

export const upsertCommunity = (
	ui: WritableUi,
	$community: Community,
	$spaces: Space[],
	$directories: Entity[],
	$memberships: Membership[],
): Writable<Community> => {
	const {memberships, communityById, communities} = ui;

	// TODO `membershipMutationHelpers`
	const $ms = memberships.get().value;
	let addedMemberships = false;
	for (const $m of $memberships) {
		// TODO could speed this up with a map cached by compound key
		if (
			!$ms.find(
				(m) => $m.community_id === m.get().community_id && $m.persona_id === m.get().persona_id,
			)
		) {
			$ms.push(writable($m));
			addedMemberships = true;
		}
	}
	if (addedMemberships) memberships.mutate();

	upsertSpaces(ui, $spaces, $directories);

	let community = communityById.get($community.community_id);
	if (community) {
		community.set($community);
	} else {
		community = writable($community);
		communityById.set($community.community_id, community);
		communities.mutate(($communities) => $communities.push(community!));
	}
	return community;
};

export const deleteCommunity = (ui: WritableUi, community_id: number): void => {
	const {
		communityById,
		communitySelection,
		personaSelection,
		communities,
		communityIdSelectionByPersonaId,
		personaById,
		memberships,
	} = ui;

	const community = communityById.get(community_id)!;

	if (communitySelection.get() === community) {
		const persona = personaSelection.get()!;
		void goto('/' + persona.get().name + location.search, {replaceState: true});
	}

	communityById.delete(community_id);
	communities.mutate(($communites) => {
		removeUnordered($communites, $communites.indexOf(community));
	});
	communityIdSelectionByPersonaId.mutate(($c) => {
		for (const [persona_id, communityIdSelection] of $c) {
			if (communityIdSelection === community_id) {
				$c.set(persona_id, personaById.get(persona_id)!.get().community_id);
			}
		}
	});

	memberships.swap(memberships.get().value.filter(($m) => $m.get().community_id !== community_id));

	// TODO delete all spaces

	// TODO delete all entities

	// TODO delete the community persona and all non-session personas who were members
	// but are no longer members of any other communities
};
