import {Logger} from '@feltjs/util/log.js';
import {round} from '@feltjs/util/maths.js';
import {page} from '$app/stores';
import {get} from 'svelte/store';
import {browser} from '$app/environment';

import type {Mutations} from '$lib/app/eventTypes';
import {updateLastSeen} from '$lib/ui/uiMutationHelpers';
import {toCommunityUrl, gotoUnlessActive} from '$lib/ui/url';
import {deserialize, deserializers} from '$lib/util/deserialize';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import type {ClientPersona} from '$lib/vocab/persona/persona';
import {stashEntities} from '$lib/vocab/entity/entityMutationHelpers';
import type {ClientSession} from '$lib/vocab/account/account';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {stashCommunities} from '$lib/vocab/community/communityMutationHelpers';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {stashPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import {stashPolicies} from '$lib/vocab/policy/policyMutationHelpers';

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

export const SetSession: Mutations['SetSession'] = async ({params, ui}) => {
	const {
		session,
		account,
		personaIdSelection,
		communityIdSelectionByPersonaId,
		spaceIdSelectionByCommunityId,
		entityById,
		queryByKey,
		sourceTiesByDestEntityId,
		destTiesBySourceEntityId,
		lastSeenByDirectoryId,
		freshnessByDirectoryId,
		freshnessByCommunityId,
	} = ui;

	const $session = params.session;
	session.set($session);
	const {guest} = $session;

	if (browser) log.trace('[setSession]', $session);
	deserialize(deserializers)($session);

	account.set(guest ? null : $session.account);

	ui.mutate(() => {
		stashPersonas(ui, guest ? [] : toInitialPersonas($session), true);
		stashCommunities(ui, guest ? [] : $session.communities, true);
		stashRoles(ui, guest ? [] : $session.roles, true);
		stashAssignments(ui, guest ? [] : $session.assignments, true);
		stashPolicies(ui, guest ? [] : $session.policies, true);
		stashSpaces(ui, guest ? [] : $session.spaces, undefined, true);
	});

	personaIdSelection.set(guest ? null : $session.sessionPersonas[0]?.persona_id ?? null);

	// TODO these two selections are hacky because using the derived stores
	// was causing various confusing issues, so they find stuff directly on the session objects
	// instead of using derived stores like `sessionPersonas` and `spacesByCommunityId`.
	communityIdSelectionByPersonaId.swap(
		// TODO first try to load this from localStorage
		new Map(guest ? null : $session.sessionPersonas.map(($p) => [$p.persona_id, $p.community_id!])),
	);
	spaceIdSelectionByCommunityId.swap(
		//TODO lookup space by community_id+path (see this comment in multiple places)
		new Map(
			guest
				? null
				: $session.communities.map(($community) => [
						$community.community_id,
						spaceIdSelectionByCommunityId
							.getJson()
							?.find((v) => v[0] === $community.community_id)?.[1] ||
							$session.spaces.find(
								(s) => s.community_id === $community.community_id && isHomeSpace(s),
							)?.space_id ||
							null,
				  ]),
		),
	);

	entityById.clear();
	queryByKey.clear();
	sourceTiesByDestEntityId.clear();
	destTiesBySourceEntityId.clear();

	lastSeenByDirectoryId.clear();
	freshnessByDirectoryId.clear();
	freshnessByCommunityId.clear();

	// Add entities after the other stores are ready.
	if (!guest) stashEntities(ui, $session.directories);
};

// TODO This is a hack until we figure out how to handle "session personas" differently from the rest.
// The issue is that the "session personas" have private fields populated
// but we don't treat them separately from regular personas when using them,
// so as a hack we swap the session personas in for the regular personas,
// but these probably need to be split into two separate collections.
// Any code that needs session personas given a regular persona could do a lookup,
// but otherwise we'd be passing around the `Persona` objects in most cases.
// This would make things typesafe as well.
const toInitialPersonas = (session: ClientSession): ClientPersona[] =>
	session.guest
		? []
		: (session.sessionPersonas as ClientPersona[]).concat(
				session.personas.filter(
					(p1) => !session.sessionPersonas.find((p2) => p2.persona_id === p1.persona_id),
				),
		  );

export const ToggleMainNav: Mutations['ToggleMainNav'] = ({ui: {expandMainNav}}) => {
	expandMainNav.update(($expandMainNav) => !$expandMainNav);
};

export const ToggleSecondaryNav: Mutations['ToggleSecondaryNav'] = ({ui: {expandMarquee}}) => {
	expandMarquee.update(($expandMarquee) => !$expandMarquee);
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
			$space.path,
			get(page).url.search,
		),
	);
};

//TODO ranem like ClearFreshness
export const ClearFreshness: Mutations['ClearFreshness'] = async ({params: {directory_id}, ui}) => {
	updateLastSeen(ui, directory_id);
};
