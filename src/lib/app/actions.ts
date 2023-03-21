import {setContext, getContext} from 'svelte';
import {Logger} from '@feltjs/util/log.js';
import {browser, dev} from '$app/environment';

import type {WritableUi} from '$lib/ui/ui';
import type {ApiClient} from '$lib/ui/ApiClient';
import type {Actions} from '$lib/app/actionTypes';
import type {BroadcastMessage} from '$lib/util/websocket';
import type {Mutation} from '$lib/ui/mutation';

const log = new Logger();

const KEY = Symbol();

export const getActions = (): Actions => getContext(KEY);

export const setActions = (value: Actions): Actions => setContext(KEY, value);

export interface ToActionsClient {
	(eventName: string): ApiClient | null;
}

export const toActions = (
	ui: WritableUi,
	mutations: Record<string, Mutation>,
	toClient: ToActionsClient,
): Actions => {
	// TODO validate the params here to improve UX, but for now we're safe letting the server validate
	const actions: Actions = new Proxy({} as any, {
		get: (_target, eventName: string) => (params: unknown) => {
			log.trace(...toLoggedArgs(eventName, params));
			const client = toClient(eventName);
			const mutation = mutations[eventName];
			if (!mutation) {
				log.warn('invoking event with no mutation', eventName, params);
				return client?.invoke(eventName, params);
			}
			return mutation({
				eventName,
				params,
				ui,
				actions,
				invoke: client ? (p = params) => client.invoke(eventName, p) : null,
			});
		},
	});
	return actions;
};

export interface ActionsBroadcastMessage {
	(message: BroadcastMessage): any;
}

export const toActionsBroadcastMessage =
	(
		ui: WritableUi,
		mutations: Record<string, Mutation>,
		actions: Actions,
	): ActionsBroadcastMessage =>
	(message) => {
		const {method: eventName, params} = message;
		log.trace(
			'%c[broadcast.%c' + eventName + '%c]',
			'color: gray',
			'color: darkCyan',
			'color: gray',
			params === undefined ? '' : params, // print null but not undefined
		);
		const mutation = mutations[eventName];
		if (!mutation) {
			log.warn('ignoring broadcast event with no mutation', eventName, params);
			return;
		}
		return mutation({
			eventName,
			params,
			ui,
			actions,
			invoke: () => Promise.resolve(message.result),
		});
	};

const toLoggedArgs = (eventName: string, params: unknown): any[] => {
	const args = toLoggedEventName(eventName);
	if (params !== undefined) args.push(params); // print null but not undefined}
	return args;
};

const toLoggedEventName = (eventName: string): any[] =>
	browser && dev
		? ['%c[actions.%c' + eventName + '%c]', 'color: gray', 'color: cornflowerblue', 'color: gray']
		: ['[actions.' + eventName + ']'];
