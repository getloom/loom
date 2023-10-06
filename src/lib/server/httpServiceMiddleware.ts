import send from '@polka/send-type';
import {Logger} from '@grogarden/util/log.js';

import {red, blue, gray} from '$lib/server/colors.js';
import type {ApiServer, HttpMiddleware} from '$lib/server/ApiServer.js';
import {
	type Service,
	toServiceRequest,
	performService,
	toApiResult,
	type AfterResponseCallback,
	flushAfterResponseCallbacks,
} from '$lib/server/service.js';
import {validateSchema, toValidationErrorMessage} from '$lib/server/ajv.js';
import {SessionApi} from '$lib/session/SessionApi.js';
import {authorize} from '$lib/server/authorize.js';
import {checkBroadcastAudience} from '$lib/server/Broadcast.js';

const log = new Logger(gray('[') + blue('httpServiceMiddleware') + gray(']'));

// Wraps a `Service` in an http `Middleware`
export const toHttpServiceMiddleware =
	(server: ApiServer, service: Service): HttpMiddleware =>
	async (req, res) => {
		const {body: reqBody, params: reqParams} = req;

		// The HTTP API requires duplicating any route params in the body
		// for consistency with the websocket API.
		// We don't want the confusion of maintaining two schemas,
		// where properties are optional in the HTTP body but required in the websocket payload.
		// This checks each of `req.params` and ensures that they match the body value exactly.
		// This ensures users don't get surprising results
		// if they make an error constructing the path+body.
		// We are only able to do this because we only support POST, not GET, for routes with params,
		// due to the complexity of getting query data serialized and deserialized.
		if (reqBody) {
			for (const paramName in reqParams) {
				if (paramName in reqBody) {
					const bodyValue = reqBody[paramName];
					// Route params are always strings, and we can infer the correct type from the body version.
					const p = reqParams[paramName];
					const t = typeof bodyValue;
					const paramValue = t === 'number' ? Number(p) : t === 'boolean' ? Boolean(p) : p;
					if (paramValue !== bodyValue) {
						return send(res, 400, {
							message: `route param '${paramName}' mismatches the request body value`,
						});
					}
				}
			}
		}

		const params = service.action.params.type === 'null' ? null : reqBody; // see the comment above

		const validateParams = validateSchema<any>(service.action.params);
		if (!validateParams(params)) {
			log.error(params);
			// TODO handle multiple errors instead of just the first
			log.error('failed to validate params', params, validateParams.errors);
			const validationError = validateParams.errors![0];
			return send(res, 400, {message: toValidationErrorMessage(validationError)});
		}

		const authorizeResult = await authorize(service, server.db.repos, req.account_id, params);
		if (!authorizeResult.ok) {
			return send(res, authorizeResult.status, {message: authorizeResult.message});
		}
		const actor = authorizeResult.value?.actor;

		let afterResponseCallbacks: AfterResponseCallback[] | null = null;

		const result = await performService(
			service,
			toServiceRequest(
				server.db.repos,
				params,
				req.account_id!, // TODO try to remove these non-null assertions without loosening type safety, is tricky
				actor!, // TODO try to remove these non-null assertions without loosening type safety, is tricky
				new SessionApi(req, res),
				server.broadcast,
				server.passwordHasher,
				(cb) => (afterResponseCallbacks || (afterResponseCallbacks = [])).push(cb),
			),
			log,
		);

		if (!result.ok) {
			send(res, result.status || 500, {message: result.message});
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
		log.debug('result.status', result.status);
		send(res, result.status, result.value);

		checkBroadcastAudience(service, result.broadcast, log);
		if (result.broadcast && service.action.broadcast) {
			await server.broadcast.send(service, toApiResult(result), params, result.broadcast);
		}

		if (afterResponseCallbacks) await flushAfterResponseCallbacks(afterResponseCallbacks);
	};
