import {goto} from '$app/navigation';
import {Logger} from '@feltcoop/felt/util/log.js';
import {round} from '@feltcoop/felt/util/maths.js';

import type {Mutations} from '$lib/app/eventTypes';
import {updateLastSeen} from '$lib/ui/uiMutationHelpers';

const log = new Logger('[uiMutations]');

export const Ping: Mutations['Ping'] = async ({invoke}) => {
	const t = performance.now();
	const result = await invoke();
	const dt = performance.now() - t;
	log.info(`ping:`, round(dt, 1) + 'ms');
	return result;
};

export const Ephemera: Mutations['Ephemera'] = async ({invoke, ui: {ephemera}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	ephemera.set(result.value);
	return result;
};

export const SetMobile: Mutations['SetMobile'] = ({params, ui: {mobile}}) => {
	mobile.set(params);
};

export const OpenDialog: Mutations['OpenDialog'] = ({params, ui: {dialogs}}) => {
	dialogs.update(($dialogs) => $dialogs.concat(params));
};

export const CloseDialog: Mutations['CloseDialog'] = ({ui: {dialogs}}) => {
	dialogs.update(($dialogs) => $dialogs.slice(0, $dialogs.length - 1));
};

export const ViewSpace: Mutations['ViewSpace'] = async ({
	params: {space_id, view},
	ui: {spaceById, viewBySpace, communitySelection, spaceIdSelectionByCommunityId, communityById},
}) => {
	const space = spaceById.get(space_id)!;
	viewBySpace.mutate(($viewBySpace) => {
		if (view) {
			$viewBySpace.set(space, view);
		} else {
			$viewBySpace.delete(space);
		}
	});
	// Navigate the browser to the target space.
	// The target community may not match the selected community,
	// so it's not as simple as checking if this is already the selected space for its community,
	// we need to check if the selected community's selected space matches this space.
	const selectedCommunity = communitySelection.get();
	const $space = space.get();
	if (
		selectedCommunity &&
		$space.space_id !==
			spaceIdSelectionByCommunityId.get().value.get(selectedCommunity.get().community_id)
	) {
		const $community = communityById.get($space.community_id)!.get();
		await goto('/' + $community.name + $space.url + location.search, {replaceState: true});
	}
};

//TODO ranem like ClearFreshness
export const ClearFreshness: Mutations['ClearFreshness'] = async ({params: {directory_id}, ui}) => {
	updateLastSeen(ui, directory_id);
};

export const ToggleMainNav: Mutations['ToggleMainNav'] = ({ui: {expandMainNav}}) => {
	expandMainNav.update(($expandMainNav) => !$expandMainNav);
};

export const ToggleSecondaryNav: Mutations['ToggleSecondaryNav'] = ({ui: {expandMarquee}}) => {
	expandMarquee.update(($expandMarquee) => !$expandMarquee);
};
