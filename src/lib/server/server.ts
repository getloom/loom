import polka from 'polka';
import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import {createServer as create_http_server} from 'http';
import {createServer as create_https_server} from 'https';
import fs from 'fs';
import {configureLogLevel, Logger, LogLevel} from '@feltcoop/felt/util/log.js';
import {format} from 'date-fns';

import {ApiServer} from '$lib/server/ApiServer.js';
import {WebsocketServer} from '$lib/server/WebsocketServer.js';
import {services} from '$lib/server/services';
import {db} from '$lib/db/db';
import {API_SERVER_PORT, VITE_DEPLOY_SERVER_HOST} from '$lib/config';

// Global logging setup
if (process.env.NODE_ENV === 'production') {
	configureLogLevel(LogLevel.Info);
	Logger.prefixes.unshift(() => format(new Date(), 'M/d H:mm:ss.SSS'));
}

const log = new Logger('[server]');

log.info('startup time:', format(new Date(), 'P H:mm:ss.SSS O'));

const create_server = (): HttpServer | HttpsServer => {
	if (process.env.NODE_ENV === 'production') {
		return create_https_server({
			//TODO double check this aligns with GRO standard (load_https_credentials)
			cert: fs.readFileSync(`/etc/letsencrypt/live/${VITE_DEPLOY_SERVER_HOST}/fullchain.pem`),
			key: fs.readFileSync(`/etc/letsencrypt/live/${VITE_DEPLOY_SERVER_HOST}/privkey.pem`),
			//cert: fs.readFileSync('localhost.crt'),
			//key: fs.readFileSync('localhost.key'),
		});
	}
	return create_http_server();
};

const server = create_server();

export const apiServer: ApiServer = new ApiServer({
	server,
	app: polka({server}),
	port: API_SERVER_PORT,
	websocketServer: new WebsocketServer(server),
	db,
	services,
});

apiServer.init().catch((err) => {
	log.error('server.init() failed', err);
	throw err;
});
