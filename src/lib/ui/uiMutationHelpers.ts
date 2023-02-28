import {derived, writable, type Readable, type Writable} from '@feltcoop/svelte-gettable-stores';

import {locallyStored} from '$lib/ui/locallyStored';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import {LAST_SEEN_KEY} from '$lib/ui/app';
import type {WritableUi} from '$lib/ui/ui';

export const setFreshnessByDirectoryId = (ui: WritableUi, directory: Writable<Entity>): void => {
	const {freshnessByDirectoryId, lastSeenByDirectoryId} = ui;
	const {entity_id} = directory.get();
	const lastSeen = lastSeenByDirectoryId.get(entity_id);
	if (!lastSeen) throw Error(`no lastSeenByDirectoryId for directory:${entity_id}`);
	if (freshnessByDirectoryId.has(entity_id)) throw Error(`derived already exists dir:${entity_id}`);
	freshnessByDirectoryId.set(
		entity_id,
		derived(
			[directory, lastSeen],
			([$directory, $lastSeen]) => $lastSeen < ($directory.updated ?? $directory.created).getTime(),
		),
	);
};

//TODO this could probably a derived store (see above) based on something like "directoriesByHubId"
export const upsertFreshnessByHubId = (ui: WritableUi, hub_id: number): void => {
	const {spacesByHubId, freshnessByHubId, freshnessByDirectoryId} = ui;
	const spaces = spacesByHubId.get().get(hub_id) || [];
	const fresh = spaces.some((s) => freshnessByDirectoryId.get(s.get().directory_id)?.get());
	if (freshnessByHubId.has(hub_id)) {
		freshnessByHubId.get(hub_id)!.set(fresh);
	} else {
		freshnessByHubId.set(hub_id, writable(fresh));
	}
};

export const setLastSeen = (ui: WritableUi, directory_id: number, time = Date.now()): void => {
	const {lastSeenByDirectoryId} = ui;
	if (lastSeenByDirectoryId.has(directory_id)) {
		throw Error(`lastSeenByDirectoryId has already been set for directory ${directory_id}`);
	}
	lastSeenByDirectoryId.set(
		directory_id,
		locallyStored(writable(time), LAST_SEEN_KEY + directory_id),
	);
};

export const updateLastSeen = (ui: WritableUi, directory_id: number, time = Date.now()): void => {
	const {lastSeenByDirectoryId, entityById, spaceById} = ui;

	const lastSeen = lastSeenByDirectoryId.get(directory_id);
	if (lastSeen && lastSeen.get() >= time) return;
	if (lastSeen) {
		lastSeen.set(time);
	} else {
		setLastSeen(ui, directory_id, time);
	}

	const directory = entityById.get(directory_id) as
		| Readable<Entity & {data: DirectoryEntityData}>
		| undefined;

	if (directory) {
		upsertFreshnessByHubId(
			ui,
			//TODO add directory field to space & vice versa to avoid this mess below
			spaceById.get(directory.get().space_id)!.get().hub_id,
		);
	}
};
