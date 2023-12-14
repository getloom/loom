import {Logger} from '@grogarden/util/log.js';
import {round} from '@grogarden/util/maths.js';
import {page} from '$app/stores';
import {get} from 'svelte/store';
import {browser} from '$app/environment';

import type {Mutations} from '$lib/vocab/action/actionTypes.js';
import {updateLastSeen} from '$lib/ui/uiMutationHelpers.js';
import {toHubUrl, gotoUnlessActive} from '$lib/util/url.js';
import {deserialize, deserializers} from '$lib/util/deserialize.js';
import {isHomeDirectory} from '$lib/vocab/space/spaceHelpers.js';
import type {ClientActor} from '$lib/vocab/actor/actor.js';
import {stashEntities} from '$lib/vocab/entity/entityMutationHelpers.js';
import type {ClientSession} from '$lib/vocab/account/account.js';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers.js';
import {stashHubs} from '$lib/vocab/hub/hubMutationHelpers.js';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers.js';
import {stashActors} from '$lib/vocab/actor/actorMutationHelpers.js';
import {stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers.js';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers.js';

const log = new Logger('[uiMutations]');

export const Ping: Mutations['Ping'] = async ({invoke}) => {
	const t = performance.now();
	const result = await invoke();
	const dt = performance.now() - t;
	log.info(`ping:`, round(dt, 1) + 'ms');
	return result;
};

export const Ephemera: Mutations['Ephemera'] = async ({invoke, mutate, ui: {ephemera}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	mutate(() => {
		ephemera.set(result.value);
	});
	return result;
};

export const SetSession: Mutations['SetSession'] = async ({mutate, afterMutation, params, ui}) => {
	const {
		session,
		account,
		actorIdSelection,
		hubIdSelectionByActorId,
		spaceIdSelectionByHubId,
		entityById,
		tiesByDestId,
		tiesBySourceId,
		lastSeenByDirectoryId,
		freshnessByDirectoryId,
		freshnessByHubId,
	} = ui;

	const $session = params.session;

	mutate(() => {
		session.set($session);
		const {guest} = $session;

		if (browser) log.debug('[setSession]', $session);
		deserialize(deserializers)($session);

		account.set(guest ? null : $session.account);

		stashActors(ui, guest ? [] : toInitialActors($session), true);
		stashHubs(ui, guest ? [] : $session.hubs, true);
		stashRoles(ui, guest ? [] : $session.roles, true);
		stashAssignments(ui, guest ? [] : $session.assignments, true);
		stashPolicies(ui, guest ? [] : $session.policies, true);
		stashSpaces(ui, afterMutation, guest ? [] : $session.spaces, undefined, true);

		actorIdSelection.set(guest ? null : $session.sessionActors[0]?.actor_id ?? null);

		// TODO these two selections are hacky because using the derived stores
		// was causing various confusing issues, so they find stuff directly on the session objects
		// instead of using derived stores like `sessionActors` and `spacesByHubId`.
		hubIdSelectionByActorId.swap(
			// TODO first try to load this from localStorage
			new Map(guest ? null : $session.sessionActors.map(($p) => [$p.actor_id, $p.hub_id])),
		);
		spaceIdSelectionByHubId.swap(
			//TODO lookup space by hub_id+path (see this comment in multiple places)
			new Map(
				guest
					? null
					: $session.hubs.map(($hub) => [
							$hub.hub_id,
							spaceIdSelectionByHubId.getJson()?.find((v) => v[0] === $hub.hub_id)?.[1] ||
								$session.spaces.find(
									(s) =>
										s.hub_id === $hub.hub_id &&
										isHomeDirectory(entityById.get(s.directory_id)!.get()),
								)?.space_id ||
								null,
						]),
			),
		);

		entityById.clear();
		tiesByDestId.clear();
		tiesBySourceId.clear();

		lastSeenByDirectoryId.clear();
		freshnessByDirectoryId.clear();
		freshnessByHubId.clear();

		// Add entities after the other stores are ready.
		if (!guest) stashEntities(ui, afterMutation, $session.directories);
	});
};

// TODO This is a hack until we figure out how to handle "session actors" differently from the rest.
// The issue is that the "session actors" have private fields populated
// but we don't treat them separately from regular actors when using them,
// so as a hack we swap the session actors in for the regular actors,
// but these probably need to be split into two separate collections.
// Any code that needs session actors given a regular actor could do a lookup,
// but otherwise we'd be passing around the `Actor` objects in most cases.
// This would make things typesafe as well.
const toInitialActors = (session: ClientSession): ClientActor[] =>
	session.guest
		? []
		: (session.sessionActors as ClientActor[]).concat(
				session.actors.filter(
					(p1) => !session.sessionActors.find((p2) => p2.actor_id === p1.actor_id),
				),
			);

export const ToggleMainNav: Mutations['ToggleMainNav'] = ({mutate, ui: {expandMainNav}}) => {
	mutate(() => {
		expandMainNav.update(($expandMainNav) => !$expandMainNav);
	});
};

export const ToggleSecondaryNav: Mutations['ToggleSecondaryNav'] = ({
	mutate,
	ui: {expandMarquee},
}) => {
	mutate(() => {
		expandMarquee.update(($expandMarquee) => !$expandMarquee);
	});
};

export const SetMobile: Mutations['SetMobile'] = ({params, mutate, ui: {mobile}}) => {
	mutate(() => {
		mobile.set(params);
	});
};

export const OpenDialog: Mutations['OpenDialog'] = ({params, mutate, ui: {dialogs}}) => {
	mutate(() => {
		dialogs.update(($dialogs) => $dialogs.concat(params));
	});
};

export const CloseDialog: Mutations['CloseDialog'] = ({mutate, ui: {dialogs}}) => {
	mutate(() => {
		dialogs.update(($dialogs) => $dialogs.slice(0, $dialogs.length - 1));
	});
};

export const ViewSpace: Mutations['ViewSpace'] = async ({
	params: {space_id, view},
	mutate,
	afterMutation,
	ui: {spaceById, viewBySpace, hubById, entityById},
}) => {
	mutate(() => {
		const space = spaceById.get(space_id)!;
		viewBySpace.mutate(($viewBySpace) => {
			if (view) {
				$viewBySpace.set(space, view);
			} else {
				$viewBySpace.delete(space);
			}
		});

		afterMutation(async () => {
			// Navgiate to the space if needed.
			// If we don't always want to do this,
			// we could either move this logic to the views or add a `navigate` boolean param.
			const $space = space.get();
			const $directory = entityById.get($space.directory_id)!.get();
			await gotoUnlessActive(
				toHubUrl(hubById.get($space.hub_id)!.get().name, $directory.path, get(page).url.search),
			);
		});
	});
};

export const ClearFreshness: Mutations['ClearFreshness'] = async ({
	mutate,
	params: {directory_id},
	ui,
}) => {
	mutate(() => {
		updateLastSeen(ui, directory_id);
	});
};
