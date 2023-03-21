import {setContext, getContext} from 'svelte';
import type {Writable as SvelteWritable} from 'svelte/store';

import type {Ui} from '$lib/ui/ui';
import type {Actions} from '$lib/app/actionTypes';
import type {SocketStore} from '$lib/ui/socket';

export interface App {
	ui: Ui;
	actions: Actions;
	socket: SocketStore;
	devmode: SvelteWritable<boolean>;
}

export const LAST_SEEN_KEY = 'lastseen:';

const KEY = Symbol();

export const getApp = (): App => getContext(KEY);

export const setApp = (stores: App): App => setContext(KEY, stores);
