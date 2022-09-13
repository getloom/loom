import {writable} from '@feltcoop/svelte-gettable-stores';
import {removeUnordered} from '@feltcoop/felt/util/array.js';

import type {Mutations} from '$lib/app/eventTypes';
import {deleteCommunity} from '$lib/vocab/community/communityMutationHelpers';

export const CreateMembership: Mutations['CreateMembership'] = async ({invoke, dispatch, ui}) => {
	const {memberships, communityById} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const {membership: $membership} = result.value;
	const {community_id} = $membership;

	// If there's no community locally, we were just added to it, so query its data in full.
	if (communityById.has(community_id)) {
		memberships.mutate(($memberships) => $memberships.push(writable($membership)));
	} else {
		const readCommunityResult = await dispatch.ReadCommunity({
			community_id: $membership.community_id,
		});
		if (!readCommunityResult.ok) return readCommunityResult;
	}

	return result;
};

export const DeleteMembership: Mutations['DeleteMembership'] = async ({params, invoke, ui}) => {
	const {memberships, sessionPersonaIds} = ui;
	const {community_id, persona_id} = params;

	const result = await invoke();
	if (!result.ok) return result;
	memberships.mutate(($memberships) => {
		const index = $memberships.findIndex((membership) => {
			const $m = membership.get();
			return $m.persona_id === persona_id && $m.community_id === community_id;
		});
		removeUnordered($memberships, index);
	});

	// If the deleted membership was the session's, and there's no remaining session memberships,
	// then delete the communtity from the client.
	const $sessionPersonaIds = sessionPersonaIds.get();
	if ($sessionPersonaIds.has(persona_id)) {
		const hasOtherSessionMembership = memberships.get().value.some((membership) => {
			const $m = membership.get();
			return $m.community_id === community_id && $sessionPersonaIds.has($m.persona_id);
		});
		if (!hasOtherSessionMembership) {
			await deleteCommunity(ui, community_id);
		}
	}

	return result;
};
