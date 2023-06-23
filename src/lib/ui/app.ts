import {setContext, getContext} from 'svelte';
import type {Writable as SvelteWritable} from 'svelte/store';

import type {Ui} from '$lib/ui/ui';
import type {Actions} from '$lib/vocab/action/actionTypes';
import type {SocketStore} from '$lib/ui/socket';
import type {QueryAddEntity, QueryMatchEntity, QueryParams, QueryStore} from '$lib/util/query';

export interface App {
	ui: Ui;
	actions: Actions;
	socket: SocketStore;
	devmode: SvelteWritable<boolean>;
	createQuery: CreateAppQuery;
}

export interface CreateAppQuery {
	(
		params: QueryParams,
		reversed?: boolean,
		addEntity?: QueryAddEntity,
		matchEntity?: QueryMatchEntity,
	): QueryStore;
}

export const LAST_SEEN_KEY = 'lastseen:';

const KEY = Symbol();

export const getApp = (): App => getContext(KEY);

export const setApp = (app: App): App => setContext(KEY, app);
