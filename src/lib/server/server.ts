import polka from 'polka';
import {createServer} from 'http';
import {Logger} from '@grogarden/util/log.js';
import {format} from 'date-fns';
import {WebSocketServer} from 'ws';
import {PUBLIC_SERVER_PORT} from '$env/static/public';

import {ApiServer} from '$lib/server/ApiServer.js';
import {Websockets} from '$lib/server/Websockets.js';
import {services} from '$lib/server/services.js';
import {db} from '$lib/db/db.js';
import {Broadcast} from '$lib/server/Broadcast.js';

// Global logging setup
if (import.meta.env.PROD) {
	Logger.prefixes.unshift(() => format(new Date(), 'M/d H:mm:ss.SSS'));
}
// Logger.level = 'debug';

const log = new Logger('[server]');

log.info('startup time:', format(new Date(), 'P H:mm:ss.SSS O'));

const server = createServer();

export const apiServer = new ApiServer({
	server,
	app: polka({server}),
	port: Number(PUBLIC_SERVER_PORT),
	websockets: new Websockets(new WebSocketServer({server})),
	broadcast: new Broadcast(db.repos),
	db,
	services,
});

apiServer
	.init()
	.then(async () => {
		if (process.argv.includes('--check')) {
			log.info('check: server started successfully');
			await apiServer.close();
			log.info('check: server closed successfully');
		}
	})
	.catch((err) => {
		log.error('server.init() failed', err);
		throw err;
	});
