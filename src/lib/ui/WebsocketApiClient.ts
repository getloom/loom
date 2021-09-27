// This is the main API client.
// It implements a request/response pattern over websockets instead of fire-and-forget
// using JSON-RPC 2.0: https://www.jsonrpc.org/specification

import {toToClientId} from '@feltcoop/felt/util/id.js';

import type {ApiClient} from '$lib/ui/ApiClient';
import type {JsonRpcRequest, JsonRpcResponse} from '$lib/util/jsonRpc';
import {parseJsonRpcResponse} from '$lib/util/jsonRpc';

const toId = toToClientId('');

// TODO doesn't handle the case where the client never hears back from the server,
// might want a timeout on each request

export interface WebsocketApiClient<
	TParamsMap extends Record<string, any>,
	TResultMap extends Record<string, any>,
> extends ApiClient<TParamsMap, TResultMap> {
	handle: (rawMessage: any) => void;
}

interface WebsocketRequest<T = any> {
	request: JsonRpcRequest;
	promise: Promise<T>;
	resolve: (result: T) => void;
}

export const toWebsocketApiClient = <
	TParamsMap extends Record<string, any>,
	TResultMap extends Record<string, any>,
>(
	send: (request: JsonRpcRequest) => void,
): WebsocketApiClient<TParamsMap, TResultMap> => {
	// TODO maybe extract a `WebsocketRequests` interface, with `add`/`remove` functions (and `pending` items?)
	const websocketRequests: Map<string, WebsocketRequest> = new Map();
	const toWebsocketRequest = <T>(request: JsonRpcRequest): WebsocketRequest<T> => {
		const websocketRequest: WebsocketRequest<T> = {request} as any;
		websocketRequest.promise = new Promise((resolve) => {
			websocketRequest.resolve = resolve;
		});
		websocketRequests.set(request.id, websocketRequest);
		return websocketRequest;
	};

	const client: WebsocketApiClient<TParamsMap, TResultMap> = {
		invoke: async (name, params) => {
			console.log('[websocket api client] invoke', name, params);
			const request: JsonRpcRequest<typeof name, TParamsMap> = {
				jsonrpc: '2.0',
				id: toId(),
				method: name,
				params,
			};
			console.log('[websocket api client] request', request);
			const websocketRequest = toWebsocketRequest<any>(request);
			send(request);
			return websocketRequest.promise;
		},
		handle: (rawMessage) => {
			const message = parseSocketMessage(rawMessage);
			console.log('[websocket api client] handle incoming message', message);
			if (!message) return;
			const found = websocketRequests.get(message.id);
			if (!found) {
				console.error(`Unable to find message with id ${message.id}`);
				return;
			}
			websocketRequests.delete(message.id);
			// TODO upstream the `ok` instead of creating a new object? could return `message.result` directly
			found.resolve({ok: message.result.status === 200, ...message.result});
		},
		close: () => {
			// ?
		},
	};
	return client;
};

// TODO do we need to support another type of message, the non-response kind?
const parseSocketMessage = (rawMessage: any): JsonRpcResponse<any> | null => {
	if (typeof rawMessage !== 'string') {
		console.error(
			'[parseSocketMessage] cannot parse websocket message; currently only supports strings',
		);
		return null;
	}
	let message: any;
	try {
		message = JSON.parse(rawMessage);
	} catch (err) {
		console.error('[parseSocketMessage] message data is not valid JSON', rawMessage, err);
		return null;
	}
	const response = parseJsonRpcResponse(message);
	if (!response) {
		console.error('[parseSocketMessage] message data is not valid JSON-RPC 2.0');
		return null;
	}
	return response;
};