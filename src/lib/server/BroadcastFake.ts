import type {WebSocket} from 'ws';

import type {IBroadcast} from '$lib/server/Broadcast.js';
import type {AccountId} from '$lib/vocab/account/account.js';

/**
 * A no-op alternative to `Broadcast` for testing purposes.
 */
export class BroadcastFake implements IBroadcast {
	async createHub(): Promise<void> {
		// no-op
	}

	async deleteHub(): Promise<void> {
		// no-op
	}

	async addActor(): Promise<void> {
		// no-op
	}

	async removeActor(): Promise<void> {
		// no-op
	}

	async send(): Promise<void> {
		// no-op
	}

	close(): void {
		// no-op
	}

	async openSocket(_socket: WebSocket, _account_id: AccountId): Promise<void> {
		// no-op
	}

	async closeSocket(_socket: WebSocket, _account_id: AccountId): Promise<void> {
		// no-op
	}
}
