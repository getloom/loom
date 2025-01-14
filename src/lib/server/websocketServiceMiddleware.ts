import type {WebSocket, Data as WebSocketMessageData} from 'ws';
import {Logger} from '@ryanatkn/belt/log.js';

import {red, blue, gray} from '$lib/server/colors.js';
import {type JsonRpcResponse, parseJsonRpcRequest} from '$lib/util/jsonRpc.js';
import type {ApiServer} from '$lib/server/ApiServer.js';
import {toValidationErrorMessage, validateSchema} from '$lib/server/ajv.js';
import {SessionApiDisabled} from '$lib/session/SessionApiDisabled.js';
import {authorize} from '$lib/server/authorize.js';
import {
	performService,
	toServiceRequest,
	type ServiceResult,
	toApiResult,
	type AfterResponseCallback,
	flushAfterResponseCallbacks,
} from '$lib/server/service.js';
import type {ApiResult} from '$lib/server/api.js';
import type {AccountId} from '$lib/vocab/account/account.js';
import {checkBroadcastAudience} from '$lib/server/Broadcast.js';

const log = new Logger(gray('[') + blue('websocketServiceMiddleware') + gray(']'));

const session = new SessionApiDisabled();

export interface WebsocketMiddleware {
	(socket: WebSocket, rawMessage: WebSocketMessageData, account_id: AccountId): Promise<void>;
}

export const toWebsocketServiceMiddleware: (server: ApiServer) => WebsocketMiddleware =
	(server) => async (socket, messageData, account_id) => {
		// This gets called every 'message' event in `WebsocketServer`.
		if (typeof messageData !== 'string') {
			log.error('cannot handle websocket message; currently only supports strings');
			return;
		}

		let rawMessage: any;
		try {
			rawMessage = JSON.parse(messageData);
		} catch (err) {
			log.error('failed to parse message', err);
			return;
		}
		log.debug('incoming', rawMessage);

		// TODO possibly move the above code to a generic `websocketMiddleware`?
		// That way we could separate any other kind of websocket messages
		// and handle services in their own module.
		const message = parseJsonRpcRequest(rawMessage);
		if (!message) {
			log.error('invalid message', rawMessage);
			return;
		}
		const {method, params} = message;
		const service = server.services.get(method);
		if (!service) {
			log.error('unhandled request method', method);
			return;
		}
		if (service.action.websockets === false) {
			log.error('service cannot be called with websockets', method);
			return;
		}

		let afterResponseCallbacks: AfterResponseCallback[] | null = null;

		let result: ServiceResult;

		//TODO parse/scrub params alongside validation
		const validateParams = validateSchema<any>(service.action.params);
		if (!validateParams(params)) {
			// TODO handle multiple errors instead of just the first
			log.error('failed to validate params', params, validateParams.errors);
			result = {
				ok: false,
				status: 400,
				message: 'invalid params: ' + toValidationErrorMessage(validateParams.errors![0]),
			};
		} else {
			const authorizeResult = await authorize(service, server.db.repos, account_id, params);
			if (!authorizeResult.ok) {
				result = {
					ok: false,
					status: authorizeResult.status,
					message: authorizeResult.message,
				};
			} else {
				const actor = authorizeResult.value?.actor;
				result = await performService(
					service,
					toServiceRequest(
						server.db.repos,
						params,
						account_id,
						actor!,
						session,
						server.broadcast,
						server.passwordHasher,
						(cb) => (afterResponseCallbacks || (afterResponseCallbacks = [])).push(cb),
					),
					log,
				); // TODO try to avoid the non-null assertions, looks tricky
			}
		}

		const apiResult = toApiResult(result);

		const responseMessage: JsonRpcResponse<ApiResult> = {
			jsonrpc: '2.0',
			id: message.id, // TODO this should only be set for the client we're responding to -- maybe don't use `response`?
			result: apiResult,
		};
		const serializedResponse = JSON.stringify(responseMessage);

		if (!result.ok) {
			socket.send(serializedResponse);
			return;
		}

		// TODO maybe do this in production too
		if (import.meta.env.DEV) {
			const validateResponse = validateSchema(service.action.response);
			if (!validateResponse(result.value)) {
				log.error(
					red('failed to validate service response'),
					service.action.name,
					result,
					validateResponse.errors,
				);
				throw Error('Service validation failed');
			}
		}

		// TODO this is very hacky -- what should the API for returning/broadcasting responses be?
		// A quick improvement would be to scope to the hub.
		// We probably also want 2 types of messages, `JsonRpcResponse` for this specific client
		// and some generic broadcast message type for everyone else.
		socket.send(serializedResponse);

		checkBroadcastAudience(service, result.broadcast, log);
		if (result.broadcast && service.action.broadcast) {
			await server.broadcast.send(service, apiResult, params, result.broadcast, socket);
		}

		if (afterResponseCallbacks) await flushAfterResponseCallbacks(afterResponseCallbacks);
	};
