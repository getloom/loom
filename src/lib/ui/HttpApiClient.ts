// This is not RESTful as in HATEOS,
// instead it's a sometimes-convenient alternative to the primary websocket API.
// Due to its secondary importance it's expected to have limitations and quirks
// compared to a thoughtfully-designed REST API.
// For future design inspiration see:
// https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md

import {inject} from 'regexparam';
import {Logger} from '@ryanatkn/belt/log.js';

import type {ApiClient} from '$lib/ui/ApiClient.js';
import type {ServiceActionData} from '$lib/vocab/action/action.js';
import type {Deserialize} from '$lib/util/deserialize.js';
import {ERROR_MESSAGE_UNKNOWN} from '$lib/util/error.js';

const log = new Logger('[http]');

export const toHttpApiClient = <
	TParamsMap extends Record<string, any>,
	TResultMap extends Record<string, any>,
>(
	findService: (name: string) => ServiceActionData | undefined,
	deserialize: Deserialize,
): ApiClient<TParamsMap, TResultMap> => {
	const client: ApiClient<TParamsMap, TResultMap> = {
		find: (name) => findService(name),
		invoke: async (name, params = null!) => {
			log.debug('invoke', name, params);
			const service = findService(name);
			if (!service) {
				return {ok: false, status: 400, message: 'failed to invoke unknown service'};
			}
			const path = params ? inject(service.route.path, params) : service.route.path;
			const {method} = service.route;
			let res;
			try {
				res = await fetch(path, {
					method,
					headers: {'content-type': 'application/json', accept: 'application/json'},
					body: method === 'GET' || method === 'HEAD' ? null : JSON.stringify(params || {}),
				});
			} catch (err) {
				log.error('fetch error', err);
				return {
					ok: false,
					status: 0, // network error
					message: ERROR_MESSAGE_UNKNOWN,
				};
			}
			let json;
			try {
				json = await res.json();
			} catch (err) {
				log.error('parse error', err, res);
				return {
					ok: false,
					status: res.status, // forward the server's claimed status even if it's wrong
					message: 'failed to parse server response',
				};
			}
			log.debug('result', res.ok, res.status, json);
			if (!res.ok) {
				return {
					ok: false,
					status: res.status,
					message: json.message || res.statusText || ERROR_MESSAGE_UNKNOWN,
				};
			}
			deserialize(json);
			return {ok: true, status: res.status, value: json};
		},
		close: () => {
			// TODO ?
		},
	};
	return client;
};
