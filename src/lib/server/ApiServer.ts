import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import type {Polka, Request as PolkaRequest, Middleware as PolkaMiddleware} from 'polka';
import bodyParser from 'body-parser';
import {Logger} from '@grogarden/util/log.js';
import {promisify} from 'util';
import type {WebSocket} from 'ws';

import {blue} from '$lib/server/colors';
import type {Database} from '$lib/db/Database';
import type {Websockets} from '$lib/server/Websockets';
import type {Service} from '$lib/server/service';
import {toHttpServiceMiddleware} from '$lib/server/httpServiceMiddleware';
import {cookieSessionMiddleware} from '$lib/session/cookieSessionMiddleware';
import {toWebsocketServiceMiddleware} from '$lib/server/websocketServiceMiddleware';
import type {CookieSessionRequest} from '$lib/session/sessionCookie';
import type {IBroadcast} from '$lib/server/Broadcast';
import type {AccountId} from '$lib/vocab/account/account';
import {createPasswordHasher, type PasswordHasher} from '$lib/server/password';

const log = new Logger([blue('[ApiServer]')]);

export interface ApiServerRequest extends PolkaRequest, CookieSessionRequest {}
export interface HttpMiddleware extends PolkaMiddleware<ApiServerRequest> {} // eslint-disable-line @typescript-eslint/no-empty-interface

export interface Options {
	server: HttpServer | HttpsServer;
	app: Polka<ApiServerRequest>;
	websockets: Websockets;
	broadcast: IBroadcast;
	port: number;
	db: Database;
	services: Map<string, Service>;
	passwordHasher?: PasswordHasher;
}

export class ApiServer {
	readonly server: HttpServer | HttpsServer;
	readonly app: Polka<ApiServerRequest>;
	readonly websockets: Websockets;
	readonly broadcast: IBroadcast;
	readonly port: number;
	readonly db: Database;
	readonly services: Map<string, Service>;
	readonly passwordHasher: PasswordHasher;

	constructor(options: Options) {
		this.server = options.server;
		this.app = options.app;
		this.websockets = options.websockets;
		this.broadcast = options.broadcast;
		this.passwordHasher = options.passwordHasher || createPasswordHasher();
		this.port = options.port;
		this.db = options.db;
		this.services = options.services;
		log.info('created');
	}

	isApiServerPathname(pathname: string): boolean {
		return pathname.startsWith('/api/');
	}

	async init(): Promise<void> {
		log.info('initing');

		// TODO refactor to paralleize `init` of the various pieces

		// Set up the app and its middleware.
		this.app
			.use(bodyParser.json())
			.use((req, _res, next) => {
				// TODO proper logger, also don't log sensitive info in prod
				log.debug('req', {
					method: req.method,
					url: req.url,
					query: req.query,
					params: req.params,
					body: req.body,
				});
				return next();
			})
			.use(cookieSessionMiddleware);

		// Register services as http routes.
		for (const service of this.services.values()) {
			this.app.add(
				service.action.route.method,
				service.action.route.path,
				toHttpServiceMiddleware(this, service),
			);
		}

		// SvelteKit Node adapter, adapted to our production API server
		if (process.env.NODE_ENV === 'production') {
			const importPath = '../../../svelte-kit/handler.js';
			let handler: any;
			try {
				({handler} = await import(importPath));
			} catch (err) {
				throw Error(`Failed to import SvelteKit adapter-node handler from ${importPath} -- ${err}`);
			}
			// TODO this is a hack to work around Polka 0.5.2's tiered middleware, should be `this.app.use(handler)`
			this.app.use((req, res, next) =>
				req.url.startsWith('/api/') ? next() : handler(req, res, next),
			);
		}

		// Websockets
		this.websockets.on('message', this.onWebsocketMessage);
		this.websockets.on('open', this.onWebsocketOpen);
		this.websockets.on('close', this.onWebsocketClose);
		await this.websockets.init();

		// Start the app.
		await new Promise<void>((resolve) => {
			this.app.listen(this.port, () => {
				log.info(`listening on localhost:${this.port}`);
				resolve();
			});
		});

		log.info('inited');
	}

	async close(): Promise<void> {
		log.info('close');
		this.websockets.off('message', this.onWebsocketMessage);
		this.websockets.off('open', this.onWebsocketOpen);
		this.websockets.off('close', this.onWebsocketClose);
		await Promise.all([
			promisify(this.app.server.close).call(this.app.server),
			this.websockets.close(),
			this.broadcast.close(),
			this.db.close(),
			this.passwordHasher.close(),
		]);
	}

	readonly onWebsocketMessage = toWebsocketServiceMiddleware(this);

	private onWebsocketOpen = (socket: WebSocket, account_id: AccountId): Promise<void> => {
		return this.broadcast.openSocket(socket, account_id);
	};

	private onWebsocketClose = (socket: WebSocket, account_id: AccountId): Promise<void> => {
		return this.broadcast.closeSocket(socket, account_id);
	};
}
