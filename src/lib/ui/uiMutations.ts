import {Logger} from '@feltcoop/util/log.js';
import {round} from '@feltcoop/util/maths.js';
import {page} from '$app/stores';
import {get} from 'svelte/store';

import type {Mutations} from '$lib/app/eventTypes';
import {updateLastSeen} from '$lib/ui/uiMutationHelpers';
import {toCommunityUrl, gotoUnlessActive} from '$lib/ui/url';

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
	ui: {spaceById, viewBySpace, communityById},
}) => {
	const space = spaceById.get(space_id)!;
	viewBySpace.mutate(($viewBySpace) => {
		if (view) {
			$viewBySpace.set(space, view);
		} else {
			$viewBySpace.delete(space);
		}
	});
	// Navgiate to the space if needed.
	// If we don't always want to do this,
	// we could either move this logic to the views or add a `navigate` boolean param.
	const $space = space.get();
	await gotoUnlessActive(
		toCommunityUrl(
			communityById.get($space.community_id)!.get().name,
			$space.url,
			get(page).url.search,
		),
	);
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
