import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';

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
