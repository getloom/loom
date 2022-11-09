import {
	writable,
	derived,
	type Readable,
	type Writable,
	mutable,
	type Mutable,
} from '@feltcoop/svelte-gettable-stores';
import {setContext, getContext, type SvelteComponent} from 'svelte';
import type {DialogData} from '@feltcoop/felt/ui/dialog/dialog.js';
import {browser} from '$app/environment';
import type {AsyncStatus} from '@feltcoop/felt';

import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {Persona} from '$lib/vocab/persona/persona';
import type {AccountModel} from '$lib/vocab/account/account';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {createContextmenuStore, type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
import {initBrowser} from '$lib/ui/init';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {locallyStored, locallyStoredMap} from '$lib/ui/locallyStored';
import type {Tie} from '$lib/vocab/tie/tie';
import {ADMIN_COMMUNITY_ID} from '$lib/app/constants';
import type {EphemeraResponse} from '$lib/app/eventTypes';
import type {ClientSession} from '$lib/session/clientSession';
import type {Role} from '$lib/vocab/role/role';

if (browser) initBrowser();

const KEY = Symbol();

export const getUi = (): Ui => getContext(KEY);

export const setUi = (store: Ui): Ui => {
	setContext(KEY, store);
	return store;
};

export interface Ui {
	// TODO instead of eagerly loading these components,
	// this should be an interface to lazy-load UI components
	components: {[key: string]: typeof SvelteComponent};

	// TODO should the mutable flat arrays be sets instead? or mutable maps from id to store?
	// if the latter, we'd need to change the

	// db state and caches
	account: Readable<AccountModel | null>;
	personas: Mutable<Array<Readable<Persona>>>;
	session: Readable<ClientSession>;
	sessionPersonas: Mutable<Array<Readable<Persona>>>;
	sessionPersonaIds: Readable<Set<number>>;
	sessionPersonaIndices: Readable<Map<Readable<Persona>, number>>;
	communities: Mutable<Array<Readable<Community>>>;
	roles: Mutable<Array<Readable<Role>>>;
	spaces: Mutable<Array<Readable<Space>>>;
	assignments: Mutable<Set<Assignment>>;
	personaById: Map<number, Readable<Persona>>;
	communityById: Map<number, Readable<Community>>;
	roleById: Map<number, Readable<Role>>;
	assignmentById: Map<number, Assignment>;
	spaceById: Map<number, Readable<Space>>;
	entityById: Map<number, Readable<Entity>>;
	tieById: Map<number, Tie>;
	// derived state
	//TODO maybe refactor to remove store around map? Like personaById
	spacesByCommunityId: Readable<Map<number, Array<Readable<Space>>>>;
	personasByCommunityId: Readable<Map<number, Array<Readable<Persona>>>>;
	rolesByCommunityId: Readable<Map<number, Array<Readable<Role>>>>;
	assignmentsByRoleId: Readable<Map<number, Assignment[]>>;
	queryByKey: Map<number, {data: Mutable<Set<Readable<Entity>>>; status: Readable<AsyncStatus>}>;
	sourceTiesByDestEntityId: Mutable<Map<number, Mutable<Set<Tie>>>>;
	destTiesBySourceEntityId: Mutable<Map<number, Mutable<Set<Tie>>>>;
	communitiesBySessionPersona: Readable<Map<Readable<Persona>, Array<Readable<Community>>>>;
	adminPersonas: Readable<Set<Readable<Persona>>>;
	// view state
	mobile: Readable<boolean>;
	layout: Writable<{width: number; height: number}>; // TODO maybe make `Readable` and update with an event? `resizeLayout`?
	expandMainNav: Readable<boolean>;
	expandMarquee: Readable<boolean>;
	contextmenu: ContextmenuStore;
	dialogs: Readable<DialogData[]>;
	viewBySpace: Mutable<WeakMap<Readable<Space>, string>>; // client overrides for the views set by the community
	ephemera: Readable<EphemeraResponse | null>;
	personaIdSelection: Readable<number | null>;
	personaSelection: Readable<Readable<Persona> | null>;
	personaIndexSelection: Readable<number | null>;
	communityIdSelectionByPersonaId: Mutable<Map<number, number | null>>;
	communitySelection: Readable<Readable<Community> | null>;
	spaceIdSelectionByCommunityId: Mutable<Map<number, number | null>>;
	spaceSelection: Readable<Readable<Space> | null>;
	lastSeenByDirectoryId: Map<number, Writable<number> | null>;
	freshnessByDirectoryId: Map<number, Readable<boolean>>;
	freshnessByCommunityId: Map<number, Writable<boolean>>;
}

export type WritableUi = ReturnType<typeof toUi>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const toUi = (
	$session: ClientSession,
	initialMobile: boolean,
	components: {[key: string]: typeof SvelteComponent},
	onError: (message: string | undefined) => void,
) => {
	const account = writable<AccountModel | null>(null);
	const session = writable<ClientSession>($session);
	// Importantly, these collections only change when items are added or removed,
	// not when the items themselves change; each item is a store that can be subscribed to.
	// TODO these `Persona`s need additional data compared to every other `Persona`
	const sessionPersonas = mutable<Array<Writable<Persona>>>([]);
	const personas = mutable<Array<Writable<Persona>>>([]);
	const communities = mutable<Array<Writable<Community>>>([]);
	const roles = mutable<Array<Writable<Role>>>([]);
	const spaces = mutable<Array<Writable<Space>>>([]);
	const assignments = mutable<Set<Assignment>>(new Set());
	const personaById: Map<number, Writable<Persona>> = new Map();
	const communityById: Map<number, Writable<Community>> = new Map();
	const roleById: Map<number, Writable<Role>> = new Map();
	const assignmentById: Map<number, Assignment> = new Map();
	const spaceById: Map<number, Writable<Space>> = new Map();
	// TODO do these maps more efficiently
	const spacesByCommunityId: Readable<Map<number, Array<Writable<Space>>>> = derived(
		[communities, spaces],
		([$communities, $spaces]) => {
			const map: Map<number, Array<Writable<Space>>> = new Map();
			for (const community of $communities.value) {
				const communitySpaces: Array<Writable<Space>> = [];
				const {community_id} = community.get();
				for (const space of $spaces.value) {
					if (space.get().community_id === community_id) {
						communitySpaces.push(space);
					}
				}
				communitySpaces.sort((_a, _b) => {
					const a = _a.get();
					const b = _b.get();
					return isHomeSpace(a) ? -1 : isHomeSpace(b) ? 1 : a.name < b.name ? -1 : 1;
				});
				map.set(community_id, communitySpaces);
			}
			return map;
		},
	);

	const personasByCommunityId: Readable<Map<number, Array<Writable<Persona>>>> = derived(
		[communities, assignments],
		([$communities, $assignments]) => {
			const map: Map<number, Array<Writable<Persona>>> = new Map();
			for (const community of $communities.value) {
				const communityPersonas: Set<Writable<Persona>> = new Set();
				const {community_id} = community.get();
				for (const assignment of $assignments.value) {
					if (assignment.community_id === community_id) {
						const persona = personaById.get(assignment.persona_id)!;
						if (persona.get().type !== 'account') continue;
						communityPersonas.add(persona);
					}
				}
				map.set(community_id, Array.from(communityPersonas));
			}
			return map;
		},
	);

	const rolesByCommunityId: Readable<Map<number, Array<Writable<Role>>>> = derived(
		[communities, roles],
		([$communities, $roles]) => {
			const map: Map<number, Array<Writable<Role>>> = new Map();
			for (const community of $communities.value) {
				const communityRoles: Array<Writable<Role>> = [];
				const {community_id} = community.get();
				for (const role of $roles.value) {
					if (role.get().community_id === community_id) {
						communityRoles.push(role);
					}
				}
				map.set(community_id, communityRoles);
			}
			return map;
		},
	);

	const assignmentsByRoleId: Readable<Map<number, Assignment[]>> = derived(
		[roles, assignments],
		([$roles, $assignments]) => {
			const map: Map<number, Assignment[]> = new Map();
			for (const role of $roles.value) {
				const roleAssignments: Assignment[] = [];
				const {role_id} = role.get();
				for (const assignment of $assignments.value) {
					if (assignment.role_id === role_id) {
						roleAssignments.push(assignment);
					}
				}
				map.set(role_id, roleAssignments);
			}
			return map;
		},
	);

	// derived state
	const personaIdSelection = writable<number | null>(null);
	const personaSelection = derived(
		[personaIdSelection],
		([$personaIdSelection]) =>
			($personaIdSelection && personaById.get($personaIdSelection)) || null,
	);
	const personaIndexSelection = derived(
		[personaSelection, sessionPersonas],
		([$personaSelection, $sessionPersonas]) =>
			$personaSelection ? $sessionPersonas.value.indexOf($personaSelection) : null,
	);
	const sessionPersonaIds = derived(
		[sessionPersonas],
		([$sessionPersonas]) => new Set($sessionPersonas.value.map((p) => p.get().persona_id)),
	);
	const sessionPersonaIndices = derived(
		[sessionPersonas],
		([$sessionPersonas]) => new Map($sessionPersonas.value.map((p, i) => [p, i])),
	);
	const communitiesBySessionPersona: Readable<Map<Writable<Persona>, Array<Writable<Community>>>> =
		derived(
			[sessionPersonas, assignments, communities],
			([$sessionPersonas, $assignments, $communities]) => {
				const map: Map<Writable<Persona>, Array<Writable<Community>>> = new Map();
				for (const sessionPersona of $sessionPersonas.value) {
					const $sessionPersona = sessionPersona.get();
					const sessionPersonaCommunities: Array<Writable<Community>> = [];
					for (const community of $communities.value) {
						const $community = community.get();
						for (const assignment of $assignments.value) {
							if (
								assignment.community_id === $community.community_id &&
								assignment.persona_id === $sessionPersona.persona_id
							) {
								sessionPersonaCommunities.push(community);
								break;
							}
						}
					}
					map.set(sessionPersona, sessionPersonaCommunities);
				}
				return map;
			},
		);
	// TODO should these be store references instead of ids?
	const communityIdSelectionByPersonaId = mutable<Map<number, number | null>>(new Map());
	const communitySelection = derived(
		[personaIdSelection, communityIdSelectionByPersonaId],
		([$personaIdSelection, $communityIdSelectionByPersonaId]) =>
			$personaIdSelection
				? communityById.get($communityIdSelectionByPersonaId.value.get($personaIdSelection)!)!
				: null,
	);
	// TODO consider making this the space store so we don't have to chase id references
	const spaceIdSelectionByCommunityId = locallyStoredMap(
		mutable(new Map<number, number | null>()),
		'spaceIdSelectionByCommunityId',
	);
	const spaceSelection = derived(
		[communitySelection, spaceIdSelectionByCommunityId],
		([$communitySelection, $spaceIdSelectionByCommunityId]) =>
			($communitySelection &&
				spaceById.get(
					$spaceIdSelectionByCommunityId.value.get($communitySelection.get()!.community_id)!,
				)) ||
			null,
	);

	const entityById: Map<number, Writable<Entity>> = new Map();
	const tieById: Map<number, Tie> = new Map();
	const queryByKey: Map<
		number,
		{data: Mutable<Set<Writable<Entity>>>; status: Writable<AsyncStatus>}
	> = new Map();
	const sourceTiesByDestEntityId: Mutable<Map<number, Mutable<Set<Tie>>>> = mutable(new Map());
	const destTiesBySourceEntityId: Mutable<Map<number, Mutable<Set<Tie>>>> = mutable(new Map());

	const lastSeenByDirectoryId: Map<number, Writable<number> | null> = new Map();
	const freshnessByDirectoryId: Map<number, Readable<boolean>> = new Map();
	const freshnessByCommunityId: Map<number, Writable<boolean>> = new Map();

	// TODO optimization: ideally this would recalculate only when the admin community's personas change, not when any assignment changes
	// TODO consider making the value of `personasByCommunityId` a set instead of array, then this could be simplified
	const adminPersonas = derived(
		[personasByCommunityId],
		([$personasByCommunityId]) => new Set($personasByCommunityId.get(ADMIN_COMMUNITY_ID)),
	);

	const mobile = writable(initialMobile);
	const layout = writable({width: 0, height: 0});
	const expandMainNav = locallyStored(writable(!initialMobile), 'expandMainNav');
	const expandMarquee = locallyStored(writable(!initialMobile), 'expandMarquee');
	const contextmenu = createContextmenuStore({layout, onError});
	const dialogs = writable<DialogData[]>([]);
	const viewBySpace = mutable(new WeakMap<Readable<Space>, string>());
	const ephemera = writable<EphemeraResponse | null>(null);

	return {
		// db data
		components,
		account,
		personas,
		roles,
		session,
		sessionPersonas,
		sessionPersonaIds,
		sessionPersonaIndices,
		spaces,
		communities,
		assignments,
		personaById,
		communityById,
		roleById,
		assignmentById,
		spaceById,
		entityById,
		tieById,
		// derived state
		spacesByCommunityId,
		personasByCommunityId,
		rolesByCommunityId,
		assignmentsByRoleId,
		queryByKey,
		sourceTiesByDestEntityId,
		destTiesBySourceEntityId,
		communitiesBySessionPersona,
		adminPersonas,
		// view state
		mobile,
		layout,
		expandMainNav,
		expandMarquee,
		contextmenu,
		dialogs,
		viewBySpace,
		ephemera,
		personaIdSelection,
		personaSelection,
		personaIndexSelection,
		communityIdSelectionByPersonaId,
		communitySelection,
		spaceIdSelectionByCommunityId,
		spaceSelection,
		lastSeenByDirectoryId,
		freshnessByDirectoryId,
		freshnessByCommunityId,
	};
};

// This ensures that the inferred `WritableUi` is assignable to `Ui`.
// The latter type is used in components and it exposes its data as `Readable` stores,
// while the former is used in mutations and exposes `Writable` stores.
// TODO try to improve this to 1) be generic, 2) not export, and 3) have no runtime representation
type Typecheck<T extends Ui> = T;
export type Typechecked = Typecheck<WritableUi>;
