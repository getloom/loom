import type {WebSocket} from 'ws';
import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {BroadcastMessage} from '$lib/util/websocket';
import type {BroadcastAudience, Service} from '$lib/server/service';
import type {ApiResult} from '$lib/server/api';
import type {HubId} from '$lib/vocab/hub/hub';
import type {ActorId} from '$lib/vocab/actor/actor';
import type {AccountId} from '$lib/vocab/account/account';
import type {Repos} from '$lib/db/Repos';

const log = new Logger(gray('[') + blue('Broadcast') + gray(']'));

const dev = process.env.NODE_ENV !== 'production'; // TODO fixme in multiple places to use `$app/environment`

export interface IBroadcastApi {
	createHub: (hub_id: HubId, account_id: AccountId, actor_id: ActorId) => Promise<void>;
	deleteHub: (hub_id: HubId) => Promise<void>;
	addActor: (hub_id: HubId, account_id: AccountId, actor_id: ActorId) => Promise<void>;
	removeActor: (hub_id: HubId, account_id: AccountId, actor_id: ActorId) => Promise<void>;
}

export interface IBroadcast extends IBroadcastApi {
	send: (
		service: Service,
		result: ApiResult,
		params: any,
		audience: BroadcastAudience,
		excludedSocket?: WebSocket,
	) => void;
	close: () => void;
	openSocket: (socket: WebSocket, account_id: AccountId) => Promise<void>;
	closeSocket: (socket: WebSocket, account_id: AccountId) => Promise<void>;
}

export class Broadcast implements IBroadcast {
	private socketsByAccount: Map<AccountId, Set<WebSocket>> = new Map();
	private socketsByHub: Map<HubId, Set<WebSocket>> = new Map();
	private hubIdsByAccount: Map<AccountId, Set<HubId>> = new Map();
	private actorIdsByAccountByHub: Map<HubId, Map<AccountId, Set<ActorId>>> = new Map();

	constructor(private readonly repos: Repos) {}

	close(): void {
		this.socketsByAccount.clear();
		this.socketsByHub.clear();
		this.hubIdsByAccount.clear();
		this.actorIdsByAccountByHub.clear();
	}

	send(
		service: Service,
		result: ApiResult,
		params: any,
		audience: BroadcastAudience,
		excludedSocket?: WebSocket,
	): void {
		const message: BroadcastMessage = {
			type: 'broadcast',
			method: service.action.name,
			result,
			params,
		};
		log.debug('broadcasting', message);
		const serialized = JSON.stringify(message);

		const sockets = this.lookupSockets(audience);

		for (const socket of sockets) {
			if (socket !== excludedSocket) {
				socket.send(serialized);
			}
		}
	}

	private lookupSockets(audience: BroadcastAudience): Set<WebSocket> {
		let sockets: Set<WebSocket>;
		if (typeof audience === 'number') {
			sockets = this.socketsByHub.get(audience) || new Set();
		} else if (audience.length === 1) {
			sockets = this.socketsByHub.get(audience[0]) || new Set();
		} else {
			sockets = new Set<WebSocket>();
			for (const hub_id of audience) {
				const hubSockets = this.socketsByHub.get(hub_id);
				if (hubSockets) {
					for (const s of hubSockets) {
						sockets.add(s);
					}
				}
			}
		}
		return sockets;
	}

	async openSocket(socket: WebSocket, account_id: AccountId): Promise<void> {
		let accountSockets = this.socketsByAccount.get(account_id);
		if (!accountSockets) {
			this.socketsByAccount.set(account_id, (accountSockets = new Set()));
		} else if (accountSockets.has(socket)) {
			return; // account already had a socket connected, so cache needs no more updating
		}
		accountSockets.add(socket);
		const {socketsByHub, actorIdsByAccountByHub, hubIdsByAccount} = this;
		const hubActors = await this.repos.actor.filterHubActorsByAccount(account_id);
		for (const {hub_id, actor_id} of hubActors) {
			let hubSockets = socketsByHub.get(hub_id);
			if (!hubSockets) {
				socketsByHub.set(hub_id, (hubSockets = new Set()));
			}
			hubSockets.add(socket);
			let actorIdsByAccount = actorIdsByAccountByHub.get(hub_id);
			if (!actorIdsByAccount) {
				actorIdsByAccountByHub.set(hub_id, (actorIdsByAccount = new Map()));
			}
			let actorIds = actorIdsByAccount.get(account_id);
			if (!actorIds) {
				actorIdsByAccount.set(account_id, (actorIds = new Set()));
			}
			actorIds.add(actor_id);
			let hubIds = hubIdsByAccount.get(account_id);
			if (!hubIds) {
				hubIdsByAccount.set(account_id, (hubIds = new Set()));
			}
			hubIds.add(hub_id);
		}
	}

	async closeSocket(socket: WebSocket, account_id: AccountId): Promise<void> {
		const accountSockets = this.socketsByAccount.get(account_id);
		if (!accountSockets) return;
		accountSockets.delete(socket);
		const lastAccountSocket = accountSockets.size === 0;
		if (lastAccountSocket) {
			this.socketsByAccount.delete(account_id);
		}
		const accountHubIds = this.hubIdsByAccount.get(account_id);
		if (accountHubIds) {
			if (lastAccountSocket) {
				this.hubIdsByAccount.delete(account_id);
			}
			const {actorIdsByAccountByHub, socketsByHub} = this;
			for (const accountHubId of accountHubIds) {
				if (lastAccountSocket) {
					const hubActorIdsByAccount = actorIdsByAccountByHub.get(accountHubId);
					if (hubActorIdsByAccount) {
						hubActorIdsByAccount.delete(account_id);
						if (hubActorIdsByAccount.size === 0) {
							actorIdsByAccountByHub.delete(accountHubId);
						}
					}
				}
				const hubSockets = socketsByHub.get(accountHubId);
				if (hubSockets) {
					hubSockets.delete(socket);
					if (hubSockets.size === 0) {
						socketsByHub.delete(accountHubId);
					}
				}
			}
		}
	}

	async createHub(hub_id: HubId, account_id: AccountId, actor_id: ActorId): Promise<void> {
		let hubActorIdsByAccount = this.actorIdsByAccountByHub.get(hub_id);
		if (!hubActorIdsByAccount) {
			this.actorIdsByAccountByHub.set(hub_id, (hubActorIdsByAccount = new Map()));
		}
		let accountHubActorIds = hubActorIdsByAccount.get(account_id);
		if (!accountHubActorIds) {
			hubActorIdsByAccount.set(account_id, (accountHubActorIds = new Set()));
		}
		accountHubActorIds.add(actor_id);

		let hubSockets = this.socketsByHub.get(hub_id);
		if (!hubSockets) {
			this.socketsByHub.set(hub_id, (hubSockets = new Set()));
		}
		const accountSockets = this.socketsByAccount.get(account_id);
		if (accountSockets) {
			for (const accountSocket of accountSockets) {
				hubSockets.add(accountSocket);
			}
		}
		let accountHubIds = this.hubIdsByAccount.get(account_id);
		if (!accountHubIds) {
			this.hubIdsByAccount.set(account_id, (accountHubIds = new Set()));
		}
		accountHubIds.add(hub_id);
	}

	async deleteHub(hub_id: HubId): Promise<void> {
		this.actorIdsByAccountByHub.delete(hub_id);
		this.socketsByHub.delete(hub_id);

		// TODO targetted instead of iterating?
		for (const accountHubIds of this.hubIdsByAccount.values()) {
			accountHubIds.delete(hub_id);
		}
	}

	async addActor(hub_id: HubId, account_id: AccountId, actor_id: ActorId): Promise<void> {
		let hubSockets = this.socketsByHub.get(hub_id);
		if (!hubSockets) {
			this.socketsByHub.set(hub_id, (hubSockets = new Set()));
		}
		const accountSockets = this.socketsByAccount.get(account_id);
		if (accountSockets) {
			for (const accountSocket of accountSockets) {
				hubSockets.add(accountSocket);
			}
		}
		let hubActorIdsByAccount = this.actorIdsByAccountByHub.get(hub_id);
		if (!hubActorIdsByAccount) {
			this.actorIdsByAccountByHub.set(hub_id, (hubActorIdsByAccount = new Map()));
		}
		let accountHubActorIds = hubActorIdsByAccount.get(account_id);
		if (!accountHubActorIds) {
			hubActorIdsByAccount.set(account_id, (accountHubActorIds = new Set()));
			let accountHubIds = this.hubIdsByAccount.get(account_id);
			if (!accountHubIds) {
				this.hubIdsByAccount.set(account_id, (accountHubIds = new Set()));
			}
			accountHubIds.add(hub_id);
		}
		accountHubActorIds.add(actor_id);
	}

	async removeActor(hub_id: HubId, account_id: AccountId, actor_id: ActorId): Promise<void> {
		const hubActorIdsByAccount = this.actorIdsByAccountByHub.get(hub_id);
		if (hubActorIdsByAccount) {
			const accountHubActorIds = hubActorIdsByAccount.get(account_id);
			if (accountHubActorIds?.delete(actor_id)) {
				// did we remove the last actor for this account from the hub? if so the account no longer has access
				if (accountHubActorIds.size === 0) {
					this.hubIdsByAccount.get(account_id)?.delete(hub_id); // no need to cleanup empty collections here, is synced with sockets
					hubActorIdsByAccount.delete(account_id);
					// did we remove the last actor from the hub?
					// if so delete the hub from caches, otherwise update the hub's caches
					if (hubActorIdsByAccount.size === 0) {
						this.actorIdsByAccountByHub.delete(hub_id);
						this.socketsByHub.delete(hub_id);
					} else {
						const accountSockets = this.socketsByAccount.get(account_id);
						if (accountSockets) {
							for (const accountSocket of accountSockets) {
								const hubSockets = this.socketsByHub.get(hub_id);
								if (hubSockets) {
									hubSockets.delete(accountSocket);
									if (hubSockets.size === 0) {
										this.socketsByHub.delete(hub_id);
									}
								}
							}
						}
					}
				}
			}
		}
	}
}

/**
 * If `broadcastAudience` is incompatible with `service`, it means we have a bug in our code.
 * @param log
 * @param broadcastAudience
 * @param service
 */
export const checkBroadcastAudience = (
	service: Service,
	broadcastAudience: BroadcastAudience | undefined,
	log: Logger,
): void => {
	if (service.action.broadcast && broadcastAudience === undefined) {
		const message = 'expected a broadcast property on the result of ' + service.action.name;
		if (dev) {
			throw Error(message);
		} else {
			log.warn(message);
		}
	}
};
