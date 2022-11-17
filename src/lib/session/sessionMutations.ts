import {browser} from '$app/environment';
import {Logger} from '@feltcoop/util/log.js';

import type {Mutations} from '$lib/app/eventTypes';
import {deserialize, deserializers} from '$lib/util/deserialize';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import type {ClientPersona} from '$lib/vocab/persona/persona';
import {stashEntities} from '$lib/vocab/entity/entityMutationHelpers';
import type {ClientSession} from '$lib/session/clientSession';
import {Mutated} from '$lib/util/Mutated';
import {stashRoles} from '$lib/vocab/role/roleMutationHelpers';
import {stashCommunities} from '$lib/vocab/community/communityMutationHelpers';
import {stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {stashPersonas} from '$lib/vocab/persona/personaMutationHelpers';
import {gotoUnlessActive, toUrl} from '$lib/ui/url';
import {stashAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';

const log = new Logger('[ui]');

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

	const mutated = new Mutated('SetSession');
	stashPersonas(ui, guest ? [] : toInitialPersonas($session), mutated, true);
	stashCommunities(ui, guest ? [] : $session.communities, mutated, true);
	stashRoles(ui, guest ? [] : $session.roles, mutated, true);
	stashAssignments(ui, guest ? [] : $session.assignments, mutated, true);
	stashSpaces(ui, guest ? [] : $session.spaces, undefined, mutated, true);
	mutated.end('SetSession');

	personaIdSelection.set(guest ? null : $session.sessionPersonas[0]?.persona_id ?? null);

	// TODO these two selections are hacky because using the derived stores
	// was causing various confusing issues, so they find stuff directly on the session objects
	// instead of using derived stores like `sessionPersonas` and `spacesByCommunityId`.
	communityIdSelectionByPersonaId.swap(
		// TODO first try to load this from localStorage
		new Map(guest ? null : $session.sessionPersonas.map(($p) => [$p.persona_id, $p.community_id!])),
	);
	spaceIdSelectionByCommunityId.swap(
		//TODO lookup space by community_id+url (see this comment in multiple places)
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

export const SignIn: Mutations['SignIn'] = async ({invoke, dispatch}) => {
	const result = await invoke();
	if (!result.ok) return result;
	dispatch.SetSession({session: result.value.session});
	return result;
};

export const SignOut: Mutations['SignOut'] = async ({invoke, dispatch}) => {
	const result = await invoke();
	if (!result.ok) return result;
	dispatch.SetSession({session: {guest: true}});
	await gotoUnlessActive(toUrl('/', ''));
	return result;
};
