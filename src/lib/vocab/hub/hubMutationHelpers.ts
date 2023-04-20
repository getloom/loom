import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {goto} from '$app/navigation';
import {get} from 'svelte/store';
import {page} from '$app/stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Hub, HubId} from '$lib/vocab/hub/hub';
import {evictSpaces} from '$lib/vocab/space/spaceMutationHelpers';
import {evictAssignments} from '$lib/vocab/assignment/assignmentMutationHelpers';
import {toHubUrl} from '$lib/ui/url';
import {evictRoles} from '$lib/vocab/role/roleMutationHelpers';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import {setIfUpdated} from '$lib/util/store';
import {isAccountActor} from '$lib/vocab/actor/actorHelpers';

export const stashHubs = (ui: WritableUi, $hubs: Hub[], replace = false): void => {
	const {hubById, hubs} = ui;
	if (replace) {
		hubById.clear();
		hubs.mutate((c) => c.clear());
	}
	for (const $hub of $hubs) {
		stashHub(ui, $hub);
	}
};

export const stashHub = (ui: WritableUi, $hub: Hub): Writable<Hub> => {
	const {hubById, hubs} = ui;

	let hub = hubById.get($hub.hub_id);
	if (hub) {
		setIfUpdated(hub, $hub);
	} else {
		hub = writable($hub);
		hubById.set($hub.hub_id, hub);
		hubs.mutate((c) => c.add(hub!));
	}

	return hub;
};

export const evictHub = (ui: WritableUi, hub_id: HubId): void => {
	const {
		hubById,
		hubSelection,
		actorSelection,
		hubs,
		hubIdSelectionByActorId,
		actorById,
		assignments,
		spacesByHubId,
		rolesByHubId,
	} = ui;

	const hub = hubById.get(hub_id);
	if (!hub) return;
	const hubRoleIds = rolesByHubId.get().get(hub_id);

	if (hubRoleIds) {
		evictRoles(
			ui,
			hubRoleIds.map((r) => r.get().role_id),
		);
	}

	if (hubSelection.get() === hub) {
		const persona = actorSelection.get()!;
		ui.afterMutation(() =>
			goto(toHubUrl(persona.get().name, null, get(page).url.search), {
				replaceState: true,
			}),
		);
	}

	evictSpaces(ui, spacesByHubId.get().get(hub_id)!);

	hubById.delete(hub_id);

	hubs.mutate((c) => c.delete(hub));

	const $hubIdSelectionByActorId = hubIdSelectionByActorId.get().value;
	let mutated = false;
	for (const [actor_id, hubIdSelection] of $hubIdSelectionByActorId) {
		if (hubIdSelection !== hub_id) continue;
		const persona = actorById.get(actor_id);
		const $persona = persona?.get();
		if (!isAccountActor($persona)) continue; // TODO this check could be refactored, shouldn't be necessary here
		$hubIdSelectionByActorId.set(actor_id, $persona.hub_id);
		mutated = true;
	}
	if (mutated) hubIdSelectionByActorId.mutate();

	// TODO could speed this up a cache of assignments by hub, see in multiple places
	const assignmentsToEvict: Assignment[] = [];
	for (const a of assignments.get().value) {
		if (a.hub_id === hub_id) {
			assignmentsToEvict.push(a);
		}
	}
	evictAssignments(ui, assignmentsToEvict);
};
