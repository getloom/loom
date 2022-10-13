import type {Mutations} from '$lib/app/eventTypes';
import {deleteCommunity, upsertCommunity} from '$lib/vocab/community/communityMutationHelpers';
import {upsertPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {stashRole} from '../role/roleMutationHelpers';

export const ReadCommunities: Mutations['ReadCommunities'] = async ({invoke}) => {
	const result = await invoke();
	// TODO These aren't cached like normal session communities.
	// However if they were, we would be able to get things like contextmenu actions for them.
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
		memberships: $memberships,
		personas: $personas,
	} = result.value;
	upsertPersonas(ui, $personas);
	upsertCommunity(ui, $community, $spaces, $directories, $memberships);
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
	upsertPersonas(ui, $personas);
	upsertCommunity(ui, $community, $spaces, $directories, $memberships);
	stashRole(ui, $role);
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
	await deleteCommunity(ui, community_id);
	return result;
};
