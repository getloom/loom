import send from '@polka/send-type';
import {Logger} from '@feltjs/util/log.js';

import {red, blue, gray} from '$lib/server/colors';
import type {ApiServer, HttpMiddleware} from '$lib/server/ApiServer';
import {type Service, toServiceRequest, performService, toApiResult} from '$lib/server/service';
import {validateSchema, toValidationErrorMessage} from '$lib/util/ajv';
import {SessionApi} from '$lib/session/SessionApi';
import {authorize} from '$lib/server/authorize';
import {checkBroadcastAudience} from '$lib/server/Broadcast';

const log = new Logger(gray('[') + blue('httpServiceMiddleware') + gray(']'));

// Wraps a `Service` in an http `Middleware`
export const toHttpServiceMiddleware =
	(server: ApiServer, service: Service): HttpMiddleware =>
	async (req, res) => {
		const {body: reqBody, params: reqParams} = req;

		// TODO hack -- remove when `id`s are changed to strings
		// (and maybe support numbers in params with a better pattern?)
		for (const paramName in req.params) {
			if (paramName.endsWith('_id')) {
				req.params[paramName] = Number(req.params[paramName]) as any;
			}
		}

		// Check each of `req.params` and ensure that they're
		// either absent from `req.body` or their values match exactly.
		// This is a nececssary check to ensure users don't get surprising results.
		// Our HTTP API supports duplicating the route params in the body
		// for convenience and consistency with the websocket API.
		if (reqBody) {
			for (const paramName in reqParams) {
				if (paramName in reqBody) {
					if (reqParams[paramName] !== reqBody[paramName]) {
						return send(res, 400, {
							message: `route param '${paramName}' mismatches the request body value`,
						});
					}
				}
			}
		}

		if (!service.action.params || !service.action.response) {
			return send(res, 500, {message: 'unimplemented service schema'});
		}

		const params = service.action.params.type === 'null' ? null : {...reqBody, ...reqParams};

		const validateParams = validateSchema<any>(service.action.params);
		if (!validateParams(params)) {
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

		const result = await performService(
			service,
			toServiceRequest(
				server.db.repos,
				params,
				req.account_id!, // TODO try to remove these non-null assertions without loosening type safety, is tricky
				actor!, // TODO try to remove these non-null assertions without loosening type safety, is tricky
				new SessionApi(req, res),
				server.broadcast,
			),
			log,
		);

		if (!result.ok) {
			send(res, result.status || 500, {message: result.message});
			return;
		}

		// TODO maybe do this in production too
		if (process.env.NODE_ENV !== 'production') {
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
			server.broadcast.send(service, toApiResult(result), params, result.broadcast);
		}
	};
