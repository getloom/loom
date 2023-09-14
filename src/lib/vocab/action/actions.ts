import {setContext, getContext} from 'svelte';
import {Logger} from '@feltjs/util/log.js';
import {browser, dev} from '$app/environment';

import type {WritableUi} from '$lib/ui/ui';
import type {ApiClient} from '$lib/ui/ApiClient';
import type {Actions} from '$lib/vocab/action/actionTypes';
import type {BroadcastMessage} from '$lib/util/websocket';
import {createMutationContext, type Mutation} from '$lib/util/mutation';

const log = new Logger();

const KEY = Symbol();

export const getActions = (): Actions => getContext(KEY);

export const setActions = (value: Actions): Actions => setContext(KEY, value);

export interface ToActionsClient {
	(actionName: string): ApiClient | null;
}

export const toActions = (
	ui: WritableUi,
	mutations: Record<string, Mutation>,
	toClient: ToActionsClient,
): Actions => {
	// TODO validate the params here to improve UX, but for now we're safe letting the server validate
	const actions: Actions = new Proxy({} as any, {
		get: (_target, actionName: string) => (params: unknown) => {
			log.debug(...toLoggedArgs(actionName, params));
			const client = toClient(actionName);
			const mutation = mutations[actionName];
			if (!mutation) {
				log.warn('invoking action with no mutation', actionName, params);
				return client?.invoke(actionName, params);
			}
			return mutation(
				createMutationContext(
					actionName,
					params,
					ui,
					actions,
					client ? (p = params) => client.invoke(actionName, p) : null,
				),
			);
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
		const {method: actionName, params} = message;
		log.debug(
			'%c[broadcast.%c' + actionName + '%c]',
			'color: gray',
			'color: darkCyan',
			'color: gray',
			params === undefined ? '' : params, // print null but not undefined
			message.result,
		);
		const mutation = mutations[actionName];
		if (!mutation) {
			log.warn('ignoring broadcast action with no mutation', actionName, params);
			return;
		}
		return mutation(
			createMutationContext(actionName, params, ui, actions, () => Promise.resolve(message.result)),
		);
	};

const toLoggedArgs = (actionName: string, params: unknown): any[] => {
	const args = toLoggedActionName(actionName);
	if (params !== undefined) args.push(params); // print null but not undefined}
	return args;
};

const toLoggedActionName = (actionName: string): any[] =>
	browser && dev
		? ['%c[actions.%c' + actionName + '%c]', 'color: gray', 'color: cornflowerblue', 'color: gray']
		: ['[actions.' + actionName + ']'];
