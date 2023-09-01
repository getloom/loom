import type {Readable} from '@feltcoop/svelte-gettable-stores';

import {GUEST_ACTOR_NAME} from '$lib/vocab/actor/constants';
import type {Entity, EntityId} from '$lib/vocab/entity/entity';
import type {Ui} from '$lib/ui/ui';
import {Logger} from '@feltjs/util/log.js';
import type {Actions} from '$lib/vocab/action/actionTypes';
import type {ActorId} from '$lib/vocab/actor/actor';
import type {Directory} from '$lib/vocab/entity/entityData';

const log = new Logger('[entityHeler]');

export const isDirectory = (entity: Entity): entity is Directory =>
	entity.entity_id === entity.directory_id;

export const toName = (entity: null | undefined | {name?: string}): string =>
	entity?.name ?? GUEST_ACTOR_NAME;

export const toIcon = (entity: null | undefined | {icon?: string}): string | null =>
	entity?.icon ?? null;

// TODO generic sort helpers -- maybe we want abstractions
// with with cached+sorted views of arrays with splice insertion for efficiency
export const sortEntitiesByCreated = (entities: Array<Readable<Entity>>): Array<Readable<Entity>> =>
	entities.sort((a, b) => (a.get().created > b.get().created ? 1 : -1));

// TODO zod?

/**
 * Converts a path string to its regular form.
 * @param path
 * @returns The scrubbed value.
 */
export const scrubEntityPath = (path: string | null | undefined): string | null | undefined =>
	path === null || path === undefined ? path : path.trim();

export const ENTITY_PATH_MAX_LENGTH = 1024;

const WHITESPACE_MATCHER = /\s/u;

/**
 * Checks if a path is valid.
 * Used for both actor and community paths.
 * @param path
 * @returns `null` if valid, otherwise an error message
 */
export const checkEntityPath = (path: string): string | null => {
	if (path.length > ENTITY_PATH_MAX_LENGTH) {
		return `path must be no longer than ${ENTITY_PATH_MAX_LENGTH} characters`;
	}
	if (!path.startsWith('/')) {
		return 'path must start with a slash';
	}
	// TODO how much do we want to constrain this?
	if (WHITESPACE_MATCHER.test(path)) {
		return 'path must not have whitespace';
	}
	if (path.includes('//')) {
		return 'path must not contain consecutive slashes';
	}
	return null;
};

/**
 * Returns an array of an entity's orderedItems mapped to entity stores.
 * @param entity
 * @param ui
 * @returns the ordered entities array or `null` if the entity has no `orderedItems` value
 */
export const lookupOrderedItems = (entity: Entity, ui: Ui): Array<Readable<Entity>> | null => {
	if (!entity.data.orderedItems) return null;
	const {entityById} = ui;
	const entities = [];
	for (const entity_id of entity.data.orderedItems) {
		const entity = entityById.get(entity_id);
		if (entity) {
			entities.push(entity);
		} else {
			log.warn('missing entity_id', entity_id);
		}
	}
	return entities;
};

/**
 * Moves an item up (towards zero index) inside the orderedCollection array of the containing entity
 * @param item
 * @param parent
 * @param actor_id
 * @param actions
 */
export const moveUp = async (
	item: Readable<Entity>,
	parent: Readable<Entity>,
	actor_id: ActorId,
	actions: Actions,
): Promise<void> => {
	const itemId = item.get().entity_id;
	const index = parent.get().data.orderedItems!.findIndex((f) => f === itemId);
	if (index === 0) return;
	parent
		.get()
		.data.orderedItems!.splice(index - 1, 0, parent.get().data.orderedItems!.splice(index, 1)[0]);
	await actions.UpdateEntities({
		actor: actor_id,
		entities: [{entity_id: parent.get().entity_id, data: {...parent.get().data}}],
	});
};

/**
 * Moves an item down (towards n index) inside the orderedCollection array of the containing entity
 * @param item
 * @param parent
 * @param actor_id
 * @param actions
 */
export const moveDown = async (
	item: Readable<Entity>,
	parent: Readable<Entity>,
	actor_id: ActorId,
	actions: Actions,
): Promise<void> => {
	const itemId = item.get().entity_id;
	const index = parent.get().data.orderedItems!.findIndex((f) => f === itemId);
	if (index === parent.get().data.orderedItems!.length - 1) return;
	parent
		.get()
		.data.orderedItems!.splice(index + 1, 0, parent.get().data.orderedItems!.splice(index, 1)[0]);
	await actions.UpdateEntities({
		actor: actor_id,
		entities: [{entity_id: parent.get().entity_id, data: {...parent.get().data}}],
	});
};

/**
 * Loads entities in the orderedItems of the parentList
 * @param parentList
 * @param orderedItems
 * @param actor_id
 * @returns an array of entity stores referenced by the parentList's orderedItems attribute, or null
 */
export const loadOrderedEntities = async (
	list: Entity,
	actor_id: ActorId,
	ui: Ui,
	actions: Actions,
): Promise<Array<Readable<Entity>> | null> => {
	let entityIdsToLoad: EntityId[] | null = null; // TODO use query helper
	const orderedItems = list.data.orderedItems;
	if (!orderedItems) return null;
	for (const entity_id of orderedItems) {
		if (!ui.entityById.has(entity_id)) {
			(entityIdsToLoad || (entityIdsToLoad = [])).push(entity_id);
		}
	}
	if (entityIdsToLoad) {
		await actions.ReadEntitiesById({actor: actor_id, entityIds: entityIdsToLoad});
	}
	return lookupOrderedItems(list, ui);
};

// TODO this just solves a small UI need - maybe expand to the entire vocabulary? generate if so
export type EntityType = 'Actor' | 'Hub';
