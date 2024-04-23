import type {WebSocketServer, WebSocket, Data as WebSocketMessageData} from 'ws';
import {promisify} from 'util';
import {EventEmitter} from 'events';
import type StrictEventEmitter from 'strict-event-emitter-types';
import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import {parseSessionCookie} from '$lib/session/sessionCookie.js';
import type {StatusMessage} from '$lib/util/websocket.js';
import type {AccountId} from '$lib/vocab/account/account.js';

// TODO detect broken connections -
// see https://github.com/websockets/ws#how-to-detect-and-close-broken-connections

const log = new Logger(gray('[') + blue('Websockets') + gray(']'));

type WebsocketServerEmitter = StrictEventEmitter<EventEmitter, WebsocketServerEvents>;
interface WebsocketServerEvents {
	message: (socket: WebSocket, message: WebSocketMessageData, account_id: AccountId) => void;
	open: (socket: WebSocket, account_id: AccountId) => void;
	close: (socket: WebSocket, account_id: AccountId) => void;
}

export class Websockets extends (EventEmitter as {new (): WebsocketServerEmitter}) {
	constructor(public readonly wss: WebSocketServer) {
		super();
	}

	async init(): Promise<void> {
		const {wss} = this;
		wss.on('connection', (socket, req) => {
			const parsed = parseSessionCookie(req.headers.cookie);
			if (!parsed) {
				log.debug('request to open connection was unauthenticated');
				socket.send(REQUIRES_AUTHENTICATION_MESSAGE_STR);
				socket.close();
				return;
			}
			const {account_id} = parsed;

			socket.on('message', (data, isBinary) => {
				const message = isBinary ? data : data.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string
				this.emit('message', socket, message, account_id);
			});
			socket.on('close', () => {
				this.emit('close', socket, account_id);
			});
			socket.on('error', (err) => {
				log.error('error', err);
			});

			this.emit('open', socket, account_id); // emit on `'connection'` -- `'open'` is client-only
		});
		wss.on('close', () => {
			log.debug('close');
		});
		wss.on('error', (error) => {
			log.debug('error', error);
		});
	}

	async close(): Promise<void> {
		for (const socket of this.wss.clients) {
			socket.terminate();
		}
		const close = promisify(this.wss.close.bind(this.wss));
		await close();
	}
}

const REQUIRES_AUTHENTICATION_MESSAGE: StatusMessage = {
	type: 'status',
	status: 401,
	message: 'please sign in before connecting via websocket',
};
const REQUIRES_AUTHENTICATION_MESSAGE_STR = JSON.stringify(REQUIRES_AUTHENTICATION_MESSAGE);
