import {setContext, getContext} from 'svelte';
import type {Writable as SvelteWritable} from 'svelte/store';

import type {Ui} from '$lib/ui/ui';
import type {Dispatch} from '$lib/app/eventTypes';
import type {SocketStore} from '$lib/ui/socket';

export interface App {
	ui: Ui;
	dispatch: Dispatch;
	socket: SocketStore;
	devmode: SvelteWritable<boolean>;
}

export const LAST_SEEN_KEY = 'lastseen:';

const KEY = Symbol();

export const getApp = (): App => getContext(KEY);

export const setApp = (stores: App): App => setContext(KEY, stores);
