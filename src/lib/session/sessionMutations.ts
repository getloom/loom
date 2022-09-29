import {browser} from '$app/environment';
import {writable} from '@feltcoop/svelte-gettable-stores';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Mutations} from '$lib/app/eventTypes';
import {deserialize, deserializers} from '$lib/util/deserialize';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import type {Persona} from '$lib/vocab/persona/persona';
import {stashEntities} from '$lib/vocab/entity/entityMutationHelpers';
import type {ClientSession} from '$lib/session/clientSession';

const log = new Logger('[ui]');

export const SetSession: Mutations['SetSession'] = async ({params, ui}) => {
	const {
		session,
		account,
		personaById,
		communityById,
		personas,
		communities,
		roles,
		roleById,
		spaceById,
		spaces,
		memberships,
		personaIdSelection,
		sessionPersonas,
		communityIdSelectionByPersonaId,
		spaceIdSelectionByCommunityId,
		entityById,
		entitiesBySourceId,
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

	const $personas = (guest ? [] : toInitialPersonas($session)).map((p) => writable(p));
	personaById.clear();
	$personas.forEach((p) => personaById.set(p.get().persona_id, p));
	personas.swap($personas);

	const $sessionPersonas = guest ? [] : $session.sessionPersonas;
	sessionPersonas.set($sessionPersonas.map((p) => personaById.get(p.persona_id)!));

	const $communities = (guest ? [] : $session.communities).map((p) => writable(p));
	communityById.clear();
	$communities.forEach((c) => communityById.set(c.get().community_id, c));
	communities.swap($communities);

	const $roles = (guest ? [] : $session.roles).map((r) => writable(r));
	roleById.clear();
	$roles.forEach((r) => roleById.set(r.get().role_id, r));
	roles.swap($roles);

	const $spaces = guest ? [] : $session.spaces.map((s) => writable(s));
	spaceById.clear();
	$spaces.forEach((s) => spaceById.set(s.get().space_id, s));
	spaces.swap($spaces);

	memberships.swap(guest ? [] : $session.memberships.map((s) => writable(s)));

	// TODO fix this and the 2 below to use the URL to initialize the correct persona+community+space
	const $firstSessionPersona = guest ? null : $sessionPersonas[0];
	personaIdSelection.set($firstSessionPersona?.persona_id ?? null);

	// TODO these two selections are hacky because using the derived stores
	// was causing various confusing issues, so they find stuff directly on the session objects
	// instead of using derived stores like `sessionPersonas` and `spacesByCommunityId`.
	communityIdSelectionByPersonaId.swap(
		// TODO first try to load this from localStorage
		new Map(guest ? null : $sessionPersonas.map(($p) => [$p.persona_id, $p.community_id])),
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
	entitiesBySourceId.clear();
	sourceTiesByDestEntityId.mutate(($v) => $v.clear());
	destTiesBySourceEntityId.mutate(($v) => $v.clear());

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
const toInitialPersonas = (session: ClientSession): Persona[] =>
	session.guest
		? []
		: session.sessionPersonas.concat(
				session.personas.filter(
					(p1) => !session.sessionPersonas.find((p2) => p2.persona_id === p1.persona_id),
				),
		  );

export const Login: Mutations['Login'] = async ({invoke, dispatch}) => {
	const result = await invoke();
	if (!result.ok) return result;
	dispatch.SetSession({session: result.value.session});
	return result;
};

export const Logout: Mutations['Logout'] = async ({invoke, dispatch}) => {
	const result = await invoke();
	if (!result.ok) return result;
	dispatch.SetSession({session: {guest: true}});
	return result;
};
