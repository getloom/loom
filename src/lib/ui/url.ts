import {base} from '$app/paths';

export const PERSONA_QUERY_KEY = 'persona';

export type SearchParams<TKey extends string = string> = Record<TKey, string | null | undefined>;

/**
 * Constructs a url string from primitives.
 * @param pathname The pathname with a leading slash.
 * @param search A search string with a leading `?` or a URLSearchParams instance.
 * @returns The base-prefixed url string.
 */
export const toUrl = (pathname: string, search: string | URLSearchParams): string =>
	base + pathname + (typeof search === 'string' ? search : '?' + search);

/**
 * Constructs a url string from a community and nullable path.
 * @param name The community name to navigate to.
 * @param path Usually `space.url`, but can be null or any path with a leading slash.
 * @param search A search string with a leading `?` or a URLSearchParams instance.
 * @returns The base-prefixed url string.
 */
export const toCommunityUrl = (
	name: string,
	path: string | null | undefined,
	search: string | URLSearchParams,
): string => toUrl('/' + name + (path && path !== '/' ? path : ''), search);

export const toSearchParams = (
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
 * @param targetPath The path the navigate to.
 * @param currentUrl The current URL object, usually `$page.url`.
 * @returns Boolean indicating if the target path equals the current url.
 */
export const isUrlEqual = (targetPath: string, currentUrl: URL): boolean =>
	targetPath === currentUrl.pathname + currentUrl.search;
