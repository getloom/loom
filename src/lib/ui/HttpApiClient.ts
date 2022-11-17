// This is not RESTful as in HATEOS,
// instead it's a sometimes-convenient alternative to the primary websocket API.
// Due to its secondary importance it's expected to have limitations and quirks
// compared to a thoughtfully-designed REST API.
// For future design inspiration see:
// https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md

import {inject} from 'regexparam';
import {Logger} from '@feltcoop/util/log.js';

import type {ApiClient} from '$lib/ui/ApiClient';
import type {ServiceEventInfo} from '$lib/vocab/event/event';
import type {Deserialize} from '$lib/util/deserialize';
import {ERROR_MESSAGE_UNKNOWN} from '$lib/util/error';

const log = new Logger('[http]');

export const toHttpApiClient = <
	TParamsMap extends Record<string, any>,
	TResultMap extends Record<string, any>,
>(
	findService: (name: string) => ServiceEventInfo | undefined,
	deserialize: Deserialize,
): ApiClient<TParamsMap, TResultMap> => {
	const client: ApiClient<TParamsMap, TResultMap> = {
		find: (name) => findService(name),
		invoke: async (name, params = null!) => {
			log.trace('invoke', name, params);
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
					headers: {'content-type': 'application/json'},
					body: method === 'GET' || method === 'HEAD' ? null : JSON.stringify(params || {}),
				});
			} catch (err) {
				log.error('fetch error', err);
				return {
					ok: false,
					status: null,
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
					status: null, // discard `res.status` because something else went wrong
					message: 'failed to parse server response',
				};
			}
			log.trace('result', res.ok, res.status, json);
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
