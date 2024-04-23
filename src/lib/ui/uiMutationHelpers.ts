import {derived, writable, type Readable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {Logger} from '@ryanatkn/belt/log.js';

import {locallyStored} from '$lib/ui/locallyStored.js';
import type {Entity, EntityId} from '$lib/vocab/entity/entity.js';
import type {Directory} from '$lib/vocab/entity/entityData.js';
import {LAST_SEEN_KEY} from '$lib/ui/app.js';
import type {WritableUi} from '$lib/ui/ui.js';
import type {HubId} from '$lib/vocab/hub/hub.js';

const log = new Logger('[uiMutationHelpers]');

export const setFreshnessByDirectoryId = (ui: WritableUi, directory: Writable<Entity>): void => {
	const {freshnessByDirectoryId, lastSeenByDirectoryId} = ui;
	const {entity_id} = directory.get();
	const lastSeen = lastSeenByDirectoryId.get(entity_id);
	if (!lastSeen) {
		log.error(`no lastSeenByDirectoryId for directory:${entity_id}`);
		return;
	}
	if (freshnessByDirectoryId.has(entity_id)) {
		log.error(`derived already exists dir:${entity_id}`);
		return;
	}
	freshnessByDirectoryId.set(
		entity_id,
		derived(
			[directory, lastSeen],
			([$directory, $lastSeen]) => $lastSeen < ($directory.updated ?? $directory.created).getTime(),
		),
	);
};

//TODO this could probably a derived store (see above) based on something like "directoriesByHubId"
export const upsertFreshnessByHubId = (ui: WritableUi, hub_id: HubId): void => {
	const {spacesByHubId, freshnessByHubId, freshnessByDirectoryId} = ui;
	const spaces = spacesByHubId.get().get(hub_id) || [];
	const fresh = spaces.some((s) => freshnessByDirectoryId.get(s.get().directory_id)?.get());
	if (freshnessByHubId.has(hub_id)) {
		freshnessByHubId.get(hub_id)!.set(fresh);
	} else {
		freshnessByHubId.set(hub_id, writable(fresh));
	}
};

export const setLastSeen = (ui: WritableUi, directory_id: EntityId, time = Date.now()): void => {
	const {lastSeenByDirectoryId} = ui;
	if (lastSeenByDirectoryId.has(directory_id)) {
		log.error(`lastSeenByDirectoryId has already been set for directory ${directory_id}`);
		return;
	}
	lastSeenByDirectoryId.set(
		directory_id,
		locallyStored(writable(time), LAST_SEEN_KEY + directory_id),
	);
};

export const updateLastSeen = (ui: WritableUi, directory_id: EntityId, time = Date.now()): void => {
	const {lastSeenByDirectoryId, entityById} = ui;

	const lastSeen = lastSeenByDirectoryId.get(directory_id);
	if (lastSeen && lastSeen.get() >= time) return;
	if (lastSeen) {
		lastSeen.set(time);
	} else {
		setLastSeen(ui, directory_id, time);
	}

	const directory = entityById.get(directory_id) as Readable<Directory> | undefined;

	if (directory) {
		upsertFreshnessByHubId(ui, directory.get().hub_id);
	}
};
