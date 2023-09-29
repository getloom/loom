import {
	writable,
	derived,
	type Readable,
	type Writable,
	mutable,
	type Mutable,
} from '@feltcoop/svelte-gettable-stores';
import {setContext, getContext, type SvelteComponent} from 'svelte';
import type {DialogParams} from '@fuz.dev/fuz/dialog.js';
import {browser} from '$app/environment';
import {EventEmitter} from 'eventemitter3';
import {createContextmenu, type ContextmenuStore} from '@fuz.dev/fuz/contextmenu.js';

import type {Hub, HubId} from '$lib/vocab/hub/hub';
import type {Space, SpaceId} from '$lib/vocab/space/space';
import type {ClientActor, AccountActor, ActorId} from '$lib/vocab/actor/actor';
import type {ClientAccount, ClientSession} from '$lib/vocab/account/account';
import type {Entity, EntityId} from '$lib/vocab/entity/entity';
import type {Assignment, AssignmentId} from '$lib/vocab/assignment/assignment';
import {initBrowser} from '$lib/ui/init';
import {isHomeDirectory} from '$lib/vocab/space/spaceHelpers';
import {locallyStored, locallyStoredMap} from '$lib/ui/locallyStored';
import type {Tie, TieId} from '$lib/vocab/tie/tie';
import {ADMIN_HUB_ID} from '$lib/util/constants';
import type {EphemeraResponse} from '$lib/vocab/action/actionTypes';
import type {Role, RoleId} from '$lib/vocab/role/role';
import type {Policy, PolicyId} from '$lib/vocab/policy/policy';
import type {QueryStore} from '$lib/util/query';

if (browser) initBrowser();

const KEY = Symbol();

export const getUi = (): Ui => getContext(KEY);

export const setUi = (store: Ui): Ui => {
	setContext(KEY, store);
	return store;
};

// TODO either add `stashed_ties`, add ties to the payload of `stashed_entities`, or rethink this pattern
export type UiEvents = EventEmitter<{stashed_entities: [Array<Readable<Entity>>]}>;

export interface Ui {
	events: UiEvents; // TODO refactor with query system work

	// TODO instead of eagerly loading these components,
	// this should be an interface to lazy-load UI components
	components: {[key: string]: typeof SvelteComponent<any>};

	// db state and caches
	account: Readable<ClientAccount | null>;
	actors: Mutable<Set<Readable<ClientActor>>>;
	session: Readable<ClientSession>;
	sessionActors: Mutable<Array<Readable<AccountActor>>>; // is an ordered list, the index is the value of the URL `actor` queryparam key
	sessionActorIndexById: Readable<Map<ActorId, number>>;
	hubs: Mutable<Set<Readable<Hub>>>;
	roles: Mutable<Set<Readable<Role>>>;
	spaces: Mutable<Set<Readable<Space>>>;
	assignments: Mutable<Set<Assignment>>;
	policies: Mutable<Set<Readable<Policy>>>;
	actorById: Map<ActorId, Readable<ClientActor>>;
	hubById: Map<HubId, Readable<Hub>>;
	roleById: Map<RoleId, Readable<Role>>;
	assignmentById: Map<AssignmentId, Assignment>;
	policyById: Map<PolicyId, Readable<Policy>>;
	spaceById: Map<SpaceId, Readable<Space>>;
	entityById: Map<EntityId, Readable<Entity>>;
	tieById: Map<TieId, Tie>;
	// derived state
	//TODO maybe refactor to remove store around map? Like actorById
	spacesByHubId: Readable<Map<HubId, Array<Readable<Space>>>>;
	actorsByHubId: Readable<Map<HubId, Array<Readable<ClientActor>>>>;
	rolesByHubId: Readable<Map<HubId, Array<Readable<Role>>>>;
	assignmentsByRoleId: Readable<Map<RoleId, Assignment[]>>;
	policiesByRoleId: Readable<Map<RoleId, Map<string, Readable<Policy>>>>;
	queryByKey: Map<number, QueryStore>;
	tiesByDestId: Map<EntityId, Mutable<Set<Tie>>>;
	tiesBySourceId: Map<EntityId, Mutable<Set<Tie>>>;
	hubsBySessionActor: Readable<Map<Readable<AccountActor>, Array<Readable<Hub>>>>;
	adminActors: Readable<Set<Readable<ClientActor>>>;
	// view state
	mobile: Readable<boolean>;
	layout: Writable<{width: number; height: number}>; // TODO maybe make `Readable` and update with an event? `resizeLayout`?
	mainLayoutView: Writable<string>;
	expandMainNav: Readable<boolean>;
	expandMarquee: Readable<boolean>;
	contextmenu: ContextmenuStore;
	dialogs: Readable<DialogParams[]>;
	viewBySpace: Mutable<WeakMap<Readable<Space>, string>>; // client overrides for the views set by the hub
	ephemera: Readable<EphemeraResponse | null>;
	actorIdSelection: Readable<ActorId | null>;
	actorSelection: Readable<Readable<AccountActor> | null>;
	actorIndexSelection: Readable<number | null>;
	hubIdSelectionByActorId: Mutable<Map<ActorId, HubId | null>>;
	hubSelection: Readable<Readable<Hub> | null>;
	spaceIdSelectionByHubId: Mutable<Map<HubId, SpaceId | null>>;
	spaceSelection: Readable<Readable<Space> | null>;
	lastSeenByDirectoryId: Map<EntityId, Writable<number> | null>;
	freshnessByDirectoryId: Map<EntityId, Readable<boolean>>;
	freshnessByHubId: Map<HubId, Writable<boolean>>;
}

export type WritableUi = ReturnType<typeof toUi>;

export const toUi = (
	$session: ClientSession,
	initialMobile: boolean,
	components: {[key: string]: typeof SvelteComponent<any>},
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
	const events: UiEvents = new EventEmitter();

	const account = writable<ClientAccount | null>(null);
	const session = writable<ClientSession>($session);
	// Importantly, these collections only change when items are added or removed,
	// not when the items themselves change; each item is a store that can be subscribed to.
	// TODO these `Actor`s need additional data compared to every other `Actor`
	const sessionActors = mutable<Array<Writable<AccountActor>>>([]);
	const actors = mutable<Set<Writable<ClientActor>>>(new Set());
	const hubs = mutable<Set<Writable<Hub>>>(new Set());
	const roles = mutable<Set<Writable<Role>>>(new Set());
	const spaces = mutable<Set<Writable<Space>>>(new Set());
	const assignments = mutable<Set<Assignment>>(new Set());
	const policies = mutable<Set<Writable<Policy>>>(new Set());
	const actorById: Map<ActorId, Writable<ClientActor>> = new Map();
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
					return isHomeDirectory(entityById.get(a.directory_id)!.get())
						? -1
						: isHomeDirectory(entityById.get(b.directory_id)!.get())
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

	const actorsByHubId: Readable<Map<HubId, Array<Writable<ClientActor>>>> = derived(
		[hubs, assignments],
		([$hubs, $assignments]) => {
			const map: Map<HubId, Array<Writable<ClientActor>>> = new Map();
			for (const hub of $hubs.value) {
				const communityActors: Set<Writable<ClientActor>> = new Set();
				const {hub_id} = hub.get();
				for (const assignment of $assignments.value) {
					if (assignment.hub_id === hub_id) {
						const actor = actorById.get(assignment.actor_id);
						if (!actor) continue;
						if (actor.get().type !== 'account') continue;
						communityActors.add(actor);
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
						rolePolicies.set(policy.get().name, policy);
					}
				}
				map.set(role_id, rolePolicies);
			}
			return map;
		},
	);

	const actorIdSelection = writable<ActorId | null>(null);
	const actorSelection = derived(
		[actorIdSelection],
		([$actorIdSelection]) =>
			($actorIdSelection && (actorById.get($actorIdSelection) as Writable<AccountActor>)) || null,
	);
	const actorIndexSelection = derived(
		[actorSelection, sessionActors],
		([$actorSelection, $sessionActors]) =>
			$actorSelection ? $sessionActors.value.indexOf($actorSelection) : null,
	);
	const sessionActorIndexById = derived(
		[sessionActors],
		([$sessionActors]) => new Map($sessionActors.value.map((p, i) => [p.get().actor_id, i])),
	);
	const hubsBySessionActor: Readable<Map<Writable<AccountActor>, Array<Writable<Hub>>>> = derived(
		[sessionActors, assignments, hubs],
		([$sessionActors, $assignments, $hubs]) => {
			const map: Map<Writable<AccountActor>, Array<Writable<Hub>>> = new Map();
			for (const sessionActor of $sessionActors.value) {
				const $sessionActor = sessionActor.get();
				const sessionActorHubs: Array<Writable<Hub>> = [];
				for (const hub of $hubs.value) {
					const $hub = hub.get();
					for (const assignment of $assignments.value) {
						if (
							assignment.hub_id === $hub.hub_id &&
							assignment.actor_id === $sessionActor.actor_id
						) {
							sessionActorHubs.push(hub);
							break;
						}
					}
				}
				map.set(sessionActor, sessionActorHubs);
			}
			return map;
		},
	);
	// TODO should these be store references instead of ids?
	const hubIdSelectionByActorId = mutable<Map<ActorId, HubId | null>>(new Map());
	const hubSelection = derived(
		[actorIdSelection, hubIdSelectionByActorId],
		([$actorIdSelection, $hubIdSelectionByActorId]) =>
			$actorIdSelection
				? hubById.get($hubIdSelectionByActorId.value.get($actorIdSelection)!)!
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
	const queryByKey: Map<number, QueryStore> = new Map();
	const tiesByDestId: Map<EntityId, Mutable<Set<Tie>>> = new Map();
	const tiesBySourceId: Map<EntityId, Mutable<Set<Tie>>> = new Map();

	const lastSeenByDirectoryId: Map<EntityId, Writable<number> | null> = new Map();
	const freshnessByDirectoryId: Map<EntityId, Readable<boolean>> = new Map();
	const freshnessByHubId: Map<HubId, Writable<boolean>> = new Map();

	// TODO optimization: ideally this would recalculate only when the admin hub's actors change, not when any assignment changes
	// TODO consider making the value of `actorsByHubId` a set instead of array, then this could be simplified
	const adminActors = derived(
		[actorsByHubId],
		([$actorsByHubId]) => new Set($actorsByHubId.get(ADMIN_HUB_ID)),
	);

	const mobile = writable(initialMobile);
	const layout = writable({width: 0, height: 0});
	const mainLayoutView = writable('<Dashboard />'); // TODO source this from the hub/space context (so routes can customize the UI)
	const expandMainNav = locallyStored(writable(!initialMobile), 'expandMainNav');
	const expandMarquee = locallyStored(writable(!initialMobile), 'expandMarquee');
	const contextmenu = createContextmenu({layout});
	const dialogs = writable<DialogParams[]>([]);
	const viewBySpace = mutable(new WeakMap<Readable<Space>, string>());
	const ephemera = writable<EphemeraResponse | null>(null);

	return {
		events,
		components,
		// db data
		account,
		actors,
		roles,
		session,
		sessionActors,
		sessionActorIndexById,
		spaces,
		hubs,
		assignments,
		policies,
		actorById,
		hubById,
		roleById,
		assignmentById,
		policyById,
		spaceById,
		entityById,
		tieById,
		// derived state
		spacesByHubId,
		actorsByHubId,
		rolesByHubId,
		assignmentsByRoleId,
		policiesByRoleId,
		queryByKey,
		tiesByDestId,
		tiesBySourceId,
		hubsBySessionActor,
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
		actorIdSelection,
		actorSelection,
		actorIndexSelection,
		hubIdSelectionByActorId,
		hubSelection,
		spaceIdSelectionByHubId,
		spaceSelection,
		lastSeenByDirectoryId,
		freshnessByDirectoryId,
		freshnessByHubId,
	} satisfies Ui; // we use `satisfies` because the `WritableUi` uses the implicit return type
};
