import type ws from 'ws';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {ApiServer} from '$lib/server/ApiServer';
import type {BroadcastMessage} from '$lib/util/websocket';
import type {Service} from '$lib/server/service';
import type {ApiResult} from '$lib/server/api';

// TODO maybe merge with `$lib/util/websocket.ts`

const log = new Logger(gray('[') + blue('broadcast') + gray(']'));

export const broadcast = (
	server: ApiServer,
	service: Service,
	result: ApiResult,
	params: any,
	socket?: ws,
): void => {
	const message: BroadcastMessage = {
		type: 'broadcast',
		method: service.event.name,
		result,
		params,
	};
	log.trace('broadcasting', message);
	const serialized = JSON.stringify(message);

	// TODO broadcast scoping - scope to hub and/or account
	// - what community this was associated with
	// - what sockets are in that community
	// Something like:
	// `server.websocketServer.socketsByHubId.get(hub_id)`
	// `server.websocketServer.getSocketsByHubId(hub_id)`
	// `DeletePersona` deals with *multiple* hubs -- given some event, who needs to know about it?
	// Each service determines which hubs should hear about a change. (hub being the starting point, needs more granularity)
	// At least two options:
	// - encode in the return value of `perform`
	// - or pass in a helper like `broadcast` to `perform` that can be called to setup who should receive the result
	for (const client of server.websocketServer.wss.clients) {
		if (client !== socket) {
			client.send(serialized);
		}
	}
};
