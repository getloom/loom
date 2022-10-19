import type {Mutations} from '$lib/app/eventTypes';
import {Mutated} from '$lib/util/Mutated';
import {evictCommunity, stashCommunity} from '$lib/vocab/community/communityMutationHelpers';
import {stashPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {evictMemberships, stashMemberships} from '$lib/vocab/membership/membershipMutationHelpers';

export const ReadCommunities: Mutations['ReadCommunities'] = async ({invoke}) => {
	const result = await invoke();
	// TODO These aren't cached like normal session communities because it's an admin-only endpoint.
	// However if they were cached, we would be able to get things like contextmenu actions for them.
	// But they'd conflict with existing data --
	// for example, these communities shouldn't be added to the main nav,
	// but that's what would happen if added to the current data stuctures.
	return result;
};

export const ReadCommunity: Mutations['ReadCommunity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {
		community: $community,
		spaces: $spaces,
		directories: $directories,
		roles: $roles,
		memberships: $memberships,
		personas: $personas,
	} = result.value;
	const mutated = new Mutated('ReadCommunity');
	stashPersonas(ui, $personas, mutated);
	stashCommunity(ui, $community, mutated);
	stashSpaces(ui, $spaces, $directories, mutated);
	stashRoles(ui, $roles, mutated);
	stashMemberships(ui, $memberships, mutated);
	mutated.end('ReadCommunity');
	return result;
};

export const CreateCommunity: Mutations['CreateCommunity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {
		community: $community,
		role: $role,
		spaces: $spaces,
		directories: $directories,
		memberships: $memberships,
		personas: $personas,
	} = result.value;
	const mutated = new Mutated('CreateCommunity');
	stashPersonas(ui, $personas, mutated);
	stashCommunity(ui, $community, mutated);
	stashSpaces(ui, $spaces, $directories, mutated);
	stashMemberships(ui, $memberships, mutated);
	stashRoles(ui, [$role], mutated);
	mutated.end('CreateCommunity');
	return result;
};

export const UpdateCommunitySettings: Mutations['UpdateCommunitySettings'] = async ({
	params,
	invoke,
	ui: {communityById},
}) => {
	// optimistic update
	const community = communityById.get(params.community_id)!;
	const originalSettings = community.get().settings;
	community.update(($community) => ({
		...$community,
		settings: {...$community.settings, ...params.settings},
	}));
	const result = await invoke();
	if (!result.ok) {
		community.update(($community) => ({...$community, settings: originalSettings}));
	}
	return result;
};

export const DeleteCommunity: Mutations['DeleteCommunity'] = async ({params, invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {community_id} = params;
	await evictCommunity(ui, community_id);
	return result;
};

export const LeaveCommunity: Mutations['LeaveCommunity'] = async ({params, invoke, ui}) => {
	const {memberships} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const {actor, community_id} = params;
	const otherMemberships = memberships
		.get()
		.value.filter((m) => m.get().community_id === community_id && m.get().persona_id !== actor);

	if (otherMemberships.length > 0) {
		evictMemberships(
			ui,
			memberships
				.get()
				.value.filter((m) => m.get().community_id === community_id && m.get().persona_id === actor),
		);
	} else {
		await evictCommunity(ui, community_id);
	}

	return result;
};
