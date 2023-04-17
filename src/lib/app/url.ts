import {page} from '$app/stores';
import {get} from 'svelte/store';

import {mergeSearchParams} from '$lib/ui/url';

export const ACTOR_QUERY_KEY = 'actor';

export const toAppSearchParams = (
	actorIndex: string | null,
	searchParams = get(page).url.searchParams,
): URLSearchParams =>
	mergeSearchParams(searchParams, {
		[ACTOR_QUERY_KEY]: actorIndex,
	});
