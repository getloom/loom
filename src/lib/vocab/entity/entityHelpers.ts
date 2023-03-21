import type {Readable} from '@feltcoop/svelte-gettable-stores';

import {GUEST_ACTOR_NAME} from '$lib/vocab/actor/constants';
import type {Entity} from '$lib/vocab/entity/entity';

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
 * Used for both persona and community paths.
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
