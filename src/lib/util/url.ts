import {goto} from '$app/navigation';
import {base} from '$app/paths';
import {page} from '$app/stores';
import {get} from 'svelte/store';

import type {EntityId} from '$lib/vocab/entity/entity';

export type SearchParams<TKey extends string = string> = Record<TKey, string | null | undefined>;

/**
 * Constructs a url string from primitives.
 * @param pathname - The pathname with a leading slash
 * @param search - A search string with a leading `?` or a URLSearchParams instance
 * @returns The base-prefixed url string
 */
export const toUrl = (pathname: string, search: string | URLSearchParams): string =>
	base + pathname + (typeof search === 'string' ? search : search.size === 0 ? '' : '?' + search);

/**
 * Constructs a url string from a hub and nullable path.
 * @param name - The hub name to navigate to
 * @param path - Usually `directory.path`, but can be null or any path with a leading slash
 * @param search - A search string with a leading `?` or a URLSearchParams instance
 * @returns The base-prefixed url string
 */
export const toHubUrl = (
	name: string,
	path: string | null | undefined,
	search: string | URLSearchParams,
): string => toUrl('/' + name + (path && path !== '/' ? path : ''), search);

export const mergeSearchParams = (
	baseParams: URLSearchParams,
	newSearchParams: SearchParams,
): URLSearchParams => {
	let finalParams: URLSearchParams | undefined;
	for (const key in newSearchParams) {
		const value = newSearchParams[key];
		if (value == null) {
			if (baseParams.has(key)) {
				if (!finalParams) finalParams = new URLSearchParams(baseParams);
				finalParams.delete(key);
			}
		} else if (value !== baseParams.get(key)) {
			if (!finalParams) finalParams = new URLSearchParams(baseParams);
			finalParams.set(key, value);
		}
	}
	return finalParams || baseParams;
};

/**
 * Is the target path equal to the current url?
 * @param targetPath - The path the navigate to
 * @param currentUrl - The current URL object, usually `$page.url`
 * @returns A boolean indicating if the target path equals the current url
 */
export const isUrlEqual = (targetPath: string, currentUrl: URL): boolean =>
	targetPath === currentUrl.pathname + currentUrl.search;

/**
 * Same as `goto`, but does nothing if already at the target path.
 * @param path - The path to `goto`
 * @param opts - The `goto` options
 * @returns `false` if navigation was short-circuited, otherwise a promise wrapping `true`
 */
export const gotoUnlessActive = (
	path: string,
	opts?: Parameters<typeof goto>[1],
): false | Promise<true> =>
	isUrlEqual(path, get(page).url) ? false : goto(path, opts).then(() => true);

export const ACTOR_QUERY_KEY = 'actor';

export const toAppSearchParams = (
	actorIndex: string | number | null | undefined,
	searchParams = get(page).url.searchParams,
): URLSearchParams => {
	const actor =
		actorIndex === 0 || actorIndex === '0' // omit the actor index unless it differs from the default
			? null
			: typeof actorIndex === 'number'
			? actorIndex + ''
			: actorIndex;
	return mergeSearchParams(searchParams, {[ACTOR_QUERY_KEY]: actor});
};

// TODO handle multiple parts including `entity.path`
// if (parts.length > 1) {}
export const parseSpacePageParams = (params: {space?: string; path?: string}): EntityId | null => {
	if (!params.space || !params.path) return null;
	const parts = params.path.split('/');
	const parsed = Number(parts[0]);
	if (parsed) return parsed;
	return null;
};
