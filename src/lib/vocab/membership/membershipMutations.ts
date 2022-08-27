import {writable} from '@feltcoop/svelte-gettable-stores';

import type {Mutations} from '$lib/app/eventTypes';

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

export const DeleteMembership: Mutations['DeleteMembership'] = async ({
	params,
	invoke,
	ui: {memberships},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	// TODO also update `communities` to remove the community unless another persona has a membership
	// also remove other data like the community persona and related memberships
	memberships.mutate(($memberships) =>
		$memberships.splice(
			$memberships.findIndex(
				(membership) =>
					membership.get().persona_id !== params.persona_id ||
					membership.get().community_id !== params.community_id,
			),
			1,
		),
	);

	return result;
};
