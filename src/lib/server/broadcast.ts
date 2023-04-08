import type ws from 'ws';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {ApiServer} from '$lib/server/ApiServer';
import type {BroadcastMessage} from '$lib/util/websocket';
import type {BroadcastInfo, Service} from '$lib/server/service';
import type {ApiResult} from '$lib/server/api';

// TODO maybe merge with `$lib/util/websocket.ts`

const log = new Logger(gray('[') + blue('broadcast') + gray(']'));

export const broadcast = (
	server: ApiServer,
	service: Service,
	result: ApiResult,
	params: any,
	_info?: BroadcastInfo, // TODO use below and make required
	socket?: ws,
): void => {
	const message: BroadcastMessage = {
		type: 'broadcast',
		method: service.action.name,
		result,
		params,
	};
	log.debug('broadcasting', message);
	const serialized = JSON.stringify(message);

	// TODO broadcast scoping - scope to hub and/or account
	// - what community this was associated with
	// - what sockets are in that community
	// Something like:
	// `server.websocketServer.socketsByHubId.get(hub_id)`
	// `server.websocketServer.getSocketsByHubId(hub_id)`
	// `DeleteActor` deals with *multiple* hubs -- given some event, who needs to know about it?
	// Each service determines which hubs should hear about a change. (hub being the starting point, needs more granularity)
	for (const client of server.websocketServer.wss.clients) {
		if (client !== socket) {
			client.send(serialized);
		}
	}
};
