import {
	writable,
	derived,
	type Readable,
	type Writable,
	mutable,
	type Mutable,
} from '@feltcoop/svelte-gettable-stores';
import {setContext, getContext, type SvelteComponent} from 'svelte';
import type {DialogData} from '@feltjs/felt-ui/dialog.js';
import {browser} from '$app/environment';
import {EventEmitter} from 'eventemitter3';

import type {Hub, HubId} from '$lib/vocab/hub/hub';
import type {Space, SpaceId} from '$lib/vocab/space/space';
import type {ClientActor, AccountActor, ActorId} from '$lib/vocab/actor/actor';
import type {ClientAccount, ClientSession} from '$lib/vocab/account/account';
import type {Entity, EntityId} from '$lib/vocab/entity/entity';
import type {Assignment, AssignmentId} from '$lib/vocab/assignment/assignment';
import {createContextmenuStore, type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
import {initBrowser} from '$lib/ui/init';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {locallyStored, locallyStoredMap} from '$lib/ui/locallyStored';
import type {Tie, TieId} from '$lib/vocab/tie/tie';
import {ADMIN_HUB_ID} from '$lib/app/constants';
import type {EphemeraResponse} from '$lib/app/actionTypes';
import type {Role, RoleId} from '$lib/vocab/role/role';
import type {Policy, PolicyId} from '$lib/vocab/policy/policy';
import type {PaginatedQueryStore, Query} from '$lib/util/query';

if (browser) initBrowser();

const KEY = Symbol();

export const getUi = (): Ui => getContext(KEY);

export const setUi = (store: Ui): Ui => {
	setContext(KEY, store);
	return store;
};

export type UiEvents = EventEmitter<{stashed_entities: [Array<Readable<Entity>>]}>;

export interface UiBatch {
	(cb: () => void): void;
}

export type AfterMutationCallback = () => void;
export interface AfterMutation {
	(cb: AfterMutationCallback): void;
}

export interface Ui {
	events: UiEvents;
	mutate: UiBatch;
	afterMutation: AfterMutation;

	// TODO instead of eagerly loading these components,
	// this should be an interface to lazy-load UI components
	components: {[key: string]: typeof SvelteComponent};

	// TODO should the mutable flat arrays be sets instead? or mutable maps from id to store?
	// if the latter, we'd need to change the

	// db state and caches
	account: Readable<ClientAccount | null>;
	personas: Mutable<Set<Readable<ClientActor>>>;
	session: Readable<ClientSession>;
	sessionActors: Mutable<Array<Readable<AccountActor>>>; // is an ordered list, the index is the value of the URL `persona` queryparam key
	sessionPersonaIndexById: Readable<Map<ActorId, number>>;
	hubs: Mutable<Set<Readable<Hub>>>;
	roles: Mutable<Set<Readable<Role>>>;
	spaces: Mutable<Set<Readable<Space>>>;
	assignments: Mutable<Set<Assignment>>;
	policies: Mutable<Set<Readable<Policy>>>;
	personaById: Map<ActorId, Readable<ClientActor>>;
	hubById: Map<HubId, Readable<Hub>>;
	roleById: Map<RoleId, Readable<Role>>;
	assignmentById: Map<AssignmentId, Assignment>;
	policyById: Map<PolicyId, Readable<Policy>>;
	spaceById: Map<SpaceId, Readable<Space>>;
	entityById: Map<EntityId, Readable<Entity>>;
	tieById: Map<TieId, Tie>;
	// derived state
	//TODO maybe refactor to remove store around map? Like personaById
	spacesByHubId: Readable<Map<HubId, Array<Readable<Space>>>>;
	personasByHubId: Readable<Map<HubId, Array<Readable<ClientActor>>>>;
	rolesByHubId: Readable<Map<HubId, Array<Readable<Role>>>>;
	assignmentsByRoleId: Readable<Map<RoleId, Assignment[]>>;
	policiesByRoleId: Readable<Map<RoleId, Map<string, Readable<Policy>>>>;
	queryByKey: Map<number, Query>;
	paginatedQueryByKey: Map<number, PaginatedQueryStore>;
	sourceTiesByDestEntityId: Map<EntityId, Mutable<Set<Tie>>>;
	destTiesBySourceEntityId: Map<EntityId, Mutable<Set<Tie>>>;
	hubsBySessionPersona: Readable<Map<Readable<AccountActor>, Array<Readable<Hub>>>>;
	adminActors: Readable<Set<Readable<ClientActor>>>;
	// view state
	mobile: Readable<boolean>;
	layout: Writable<{width: number; height: number}>; // TODO maybe make `Readable` and update with an event? `resizeLayout`?
	mainLayoutView: Writable<string>;
	expandMainNav: Readable<boolean>;
	expandMarquee: Readable<boolean>;
	contextmenu: ContextmenuStore;
	dialogs: Readable<DialogData[]>;
	viewBySpace: Mutable<WeakMap<Readable<Space>, string>>; // client overrides for the views set by the hub
	ephemera: Readable<EphemeraResponse | null>;
	personaIdSelection: Readable<ActorId | null>;
	personaSelection: Readable<Readable<AccountActor> | null>;
	personaIndexSelection: Readable<number | null>;
	hubIdSelectionByPersonaId: Mutable<Map<ActorId, HubId | null>>;
	hubSelection: Readable<Readable<Hub> | null>;
	spaceIdSelectionByHubId: Mutable<Map<HubId, SpaceId | null>>;
	spaceSelection: Readable<Readable<Space> | null>;
	lastSeenByDirectoryId: Map<EntityId, Writable<number> | null>;
	freshnessByDirectoryId: Map<EntityId, Readable<boolean>>;
	freshnessByHubId: Map<HubId, Writable<boolean>>;
}

export type WritableUi = ReturnType<typeof toUi>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const toUi = (
	$session: ClientSession,
	initialMobile: boolean,
	components: {[key: string]: typeof SvelteComponent},
	onError: (message: string | undefined) => void,
) => {
	const events: UiEvents = new EventEmitter();

	const afterMutationCallbacks: AfterMutationCallback[] = [];
	// Wraps mutations into a single batch, flushing `afterMutationCallbacks` at the end.
	// Mutations can do `ui.afterMutation(cb)` to add an cb.
	const mutate = (cb: () => void): void => {
		// TODO call into a store batch function so we get atomic updates (see `@preactjs/signals` as an example)
		cb();
		if (afterMutationCallbacks.length) {
			for (const cb of afterMutationCallbacks) {
				cb(); // don't await promises
			}
			afterMutationCallbacks.length = 0;
		}
	};
	// TODO we probably want to add a way to let cbs register a key
	// so they can override each other (e.g. so there's only ever a single navigation)
	const afterMutation = (cb: AfterMutationCallback) => {
		afterMutationCallbacks.push(cb);
	};

	const account = writable<ClientAccount | null>(null);
	const session = writable<ClientSession>($session);
	// Importantly, these collections only change when items are added or removed,
	// not when the items themselves change; each item is a store that can be subscribed to.
	// TODO these `Persona`s need additional data compared to every other `Persona`
	const sessionActors = mutable<Array<Writable<AccountActor>>>([]);
	const personas = mutable<Set<Writable<ClientActor>>>(new Set());
	const hubs = mutable<Set<Writable<Hub>>>(new Set());
	const roles = mutable<Set<Writable<Role>>>(new Set());
	const spaces = mutable<Set<Writable<Space>>>(new Set());
	const assignments = mutable<Set<Assignment>>(new Set());
	const policies = mutable<Set<Writable<Policy>>>(new Set());
	const personaById: Map<ActorId, Writable<ClientActor>> = new Map();
	const hubById: Map<HubId, Writable<Hub>> = new Map();
	const roleById: Map<RoleId, Writable<Role>> = new Map();
	const assignmentById: Map<AssignmentId, Assignment> = new Map();
	const policyById: Map<PolicyId, Writable<Policy>> = new Map();
	const spaceById: Map<SpaceId, Writable<Space>> = new Map();

	// TODO do these maps more efficiently
	const spacesByHubId: Readable<Map<HubId, Array<Writable<Space>>>> = derived(
		[hubs, spaces],
		([$hubs, $spaces]) => {
			const map: Map<HubId, Array<Writable<Space>>> = new Map();
			for (const hub of $hubs.value) {
				const hubSpaces: Array<Writable<Space>> = [];
				const {hub_id} = hub.get();
				for (const space of $spaces.value) {
					if (space.get().hub_id === hub_id) {
						hubSpaces.push(space);
					}
				}
				hubSpaces.sort((_a, _b) => {
					const a = _a.get();
					const b = _b.get();
					return isHomeSpace(entityById.get(a.directory_id)!.get())
						? -1
						: isHomeSpace(entityById.get(b.directory_id)!.get())
						? 1
						: a.name < b.name
						? -1
						: 1;
				});
				map.set(hub_id, hubSpaces);
			}
			return map;
		},
	);

	const personasByHubId: Readable<Map<HubId, Array<Writable<ClientActor>>>> = derived(
		[hubs, assignments],
		([$hubs, $assignments]) => {
			const map: Map<HubId, Array<Writable<ClientActor>>> = new Map();
			for (const hub of $hubs.value) {
				const communityActors: Set<Writable<ClientActor>> = new Set();
				const {hub_id} = hub.get();
				for (const assignment of $assignments.value) {
					if (assignment.hub_id === hub_id) {
						const persona = personaById.get(assignment.persona_id);
						if (!persona) continue;
						if (persona.get().type !== 'account') continue;
						communityActors.add(persona);
					}
				}
				map.set(hub_id, Array.from(communityActors));
			}
			return map;
		},
	);

	const rolesByHubId: Readable<Map<HubId, Array<Writable<Role>>>> = derived(
		[hubs, roles],
		([$hubs, $roles]) => {
			const map: Map<HubId, Array<Writable<Role>>> = new Map();
			for (const hub of $hubs.value) {
				const hubRoles: Array<Writable<Role>> = [];
				const {hub_id} = hub.get();
				for (const role of $roles.value) {
					if (role.get().hub_id === hub_id) {
						hubRoles.push(role);
					}
				}
				map.set(hub_id, hubRoles);
			}
			return map;
		},
	);

	const assignmentsByRoleId: Readable<Map<RoleId, Assignment[]>> = derived(
		[roles, assignments],
		([$roles, $assignments]) => {
			const map: Map<RoleId, Assignment[]> = new Map();
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

	const policiesByRoleId: Readable<Map<RoleId, Map<string, Writable<Policy>>>> = derived(
		[roles, policies],
		([$roles, $policies]) => {
			const map: Map<RoleId, Map<string, Writable<Policy>>> = new Map();
			for (const role of $roles.value) {
				const rolePolicies: Map<string, Writable<Policy>> = new Map();
				const {role_id} = role.get();
				for (const policy of $policies.value) {
					if (policy.get().role_id === role_id) {
						rolePolicies.set(policy.get().permission, policy);
					}
				}
				map.set(role_id, rolePolicies);
			}
			return map;
		},
	);

	const personaIdSelection = writable<ActorId | null>(null);
	const personaSelection = derived(
		[personaIdSelection],
		([$personaIdSelection]) =>
			($personaIdSelection && (personaById.get($personaIdSelection) as Writable<AccountActor>)) ||
			null,
	);
	const personaIndexSelection = derived(
		[personaSelection, sessionActors],
		([$personaSelection, $sessionActors]) =>
			$personaSelection ? $sessionActors.value.indexOf($personaSelection) : null,
	);
	const sessionPersonaIndexById = derived(
		[sessionActors],
		([$sessionActors]) => new Map($sessionActors.value.map((p, i) => [p.get().persona_id, i])),
	);
	const hubsBySessionPersona: Readable<Map<Writable<AccountActor>, Array<Writable<Hub>>>> = derived(
		[sessionActors, assignments, hubs],
		([$sessionActors, $assignments, $hubs]) => {
			const map: Map<Writable<AccountActor>, Array<Writable<Hub>>> = new Map();
			for (const sessionPersona of $sessionActors.value) {
				const $sessionPersona = sessionPersona.get();
				const sessionPersonaHubs: Array<Writable<Hub>> = [];
				for (const hub of $hubs.value) {
					const $hub = hub.get();
					for (const assignment of $assignments.value) {
						if (
							assignment.hub_id === $hub.hub_id &&
							assignment.persona_id === $sessionPersona.persona_id
						) {
							sessionPersonaHubs.push(hub);
							break;
						}
					}
				}
				map.set(sessionPersona, sessionPersonaHubs);
			}
			return map;
		},
	);
	// TODO should these be store references instead of ids?
	const hubIdSelectionByPersonaId = mutable<Map<ActorId, HubId | null>>(new Map());
	const hubSelection = derived(
		[personaIdSelection, hubIdSelectionByPersonaId],
		([$personaIdSelection, $hubIdSelectionByPersonaId]) =>
			$personaIdSelection
				? hubById.get($hubIdSelectionByPersonaId.value.get($personaIdSelection)!)!
				: null,
	);
	// TODO consider making this the space store so we don't have to chase id references
	const spaceIdSelectionByHubId = locallyStoredMap(
		mutable(new Map<HubId, SpaceId | null>()),
		'spaceIdSelectionByHubId',
	);
	const spaceSelection = derived(
		[hubSelection, spaceIdSelectionByHubId],
		([$hubSelection, $spaceIdSelectionByHubId]) =>
			($hubSelection &&
				spaceById.get($spaceIdSelectionByHubId.value.get($hubSelection.get()!.hub_id)!)) ||
			null,
	);

	const entityById: Map<EntityId, Writable<Entity>> = new Map();
	const tieById: Map<TieId, Tie> = new Map();
	const queryByKey: Map<number, Query> = new Map();
	const paginatedQueryByKey: Map<number, PaginatedQueryStore> = new Map();
	const sourceTiesByDestEntityId: Map<EntityId, Mutable<Set<Tie>>> = new Map();
	const destTiesBySourceEntityId: Map<EntityId, Mutable<Set<Tie>>> = new Map();

	const lastSeenByDirectoryId: Map<EntityId, Writable<number> | null> = new Map();
	const freshnessByDirectoryId: Map<EntityId, Readable<boolean>> = new Map();
	const freshnessByHubId: Map<HubId, Writable<boolean>> = new Map();

	// TODO optimization: ideally this would recalculate only when the admin hub's personas change, not when any assignment changes
	// TODO consider making the value of `personasByHubId` a set instead of array, then this could be simplified
	const adminActors = derived(
		[personasByHubId],
		([$personasByHubId]) => new Set($personasByHubId.get(ADMIN_HUB_ID)),
	);

	const mobile = writable(initialMobile);
	const layout = writable({width: 0, height: 0});
	const mainLayoutView = writable('<Dashboard />'); // TODO source this from the hub/space context (so routes can customize the UI)
	const expandMainNav = locallyStored(writable(!initialMobile), 'expandMainNav');
	const expandMarquee = locallyStored(writable(!initialMobile), 'expandMarquee');
	const contextmenu = createContextmenuStore({layout, onError});
	const dialogs = writable<DialogData[]>([]);
	const viewBySpace = mutable(new WeakMap<Readable<Space>, string>());
	const ephemera = writable<EphemeraResponse | null>(null);

	return {
		events,
		mutate,
		afterMutation,
		components,
		// db data
		account,
		personas,
		roles,
		session,
		sessionActors,
		sessionPersonaIndexById,
		spaces,
		hubs,
		assignments,
		policies,
		personaById,
		hubById,
		roleById,
		assignmentById,
		policyById,
		spaceById,
		entityById,
		tieById,
		// derived state
		spacesByHubId,
		personasByHubId,
		rolesByHubId,
		assignmentsByRoleId,
		policiesByRoleId,
		queryByKey,
		paginatedQueryByKey,
		sourceTiesByDestEntityId,
		destTiesBySourceEntityId,
		hubsBySessionPersona,
		adminActors,
		// view state
		mobile,
		layout,
		mainLayoutView,
		expandMainNav,
		expandMarquee,
		contextmenu,
		dialogs,
		viewBySpace,
		ephemera,
		personaIdSelection,
		personaSelection,
		personaIndexSelection,
		hubIdSelectionByPersonaId,
		hubSelection,
		spaceIdSelectionByHubId,
		spaceSelection,
		lastSeenByDirectoryId,
		freshnessByDirectoryId,
		freshnessByHubId,
	} satisfies Ui; // we use `satisfies` because the `WritableUi` uses the implicit return type
};
