import polka from 'polka';
import {createServer} from 'http';
import {Logger} from '@feltjs/util/log.js';
import {format} from 'date-fns';
import {WebSocketServer} from 'ws';

import {ApiServer} from '$lib/server/ApiServer';
import {Websockets} from '$lib/server/Websockets';
import {services} from '$lib/server/services';
import {db} from '$lib/db/db';
import {fromEnv} from '$lib/server/env';
import {Broadcast} from '$lib/server/Broadcast';

// Global logging setup
if (process.env.NODE_ENV === 'production') {
	Logger.prefixes.unshift(() => format(new Date(), 'M/d H:mm:ss.SSS'));
}
// Logger.level = 'debug';

const log = new Logger('[server]');

log.info('startup time:', format(new Date(), 'P H:mm:ss.SSS O'));

const server = createServer();

export const apiServer = new ApiServer({
	server,
	app: polka({server}),
	port: Number(fromEnv('PUBLIC_API_SERVER_PORT')),
	websockets: new Websockets(new WebSocketServer({server})),
	broadcast: new Broadcast(db.repos),
	db,
	services,
});

apiServer.init().catch((err) => {
	log.error('server.init() failed', err);
	throw err;
});
