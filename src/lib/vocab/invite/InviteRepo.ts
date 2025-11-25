import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from 'kleur/colors';
import {PostgresRepo} from '$lib/db/PostgresRepo.js';
import type {AccountId} from '$lib/vocab/account/account.js';
import type {InviteColumn} from '$lib/vocab/invite/inviteHelpers.server.js';
import type {Invite, InviteStatus} from '$lib/vocab/invite/invite.js';

const log = new Logger(gray('[') + blue('InviteRepo') + gray(']'));

export class InviteRepo extends PostgresRepo {
	async create<T extends InviteColumn>(
		account_id: AccountId,
		columns: T[],
	): Promise<Pick<Invite, T>> {
		const code = crypto.randomUUID();
		const status: InviteStatus = 'open';
		const data = await this.sql<Array<Pick<Invite, T>>>`
			INSERT INTO invites (code, status, from_id) VALUES (
				${code}, ${status}, ${account_id}
			) RETURNING ${this.sql(columns as string[])}
		`;
		log.debug('created invite', data[0]);
		return data[0];
	}

	async findActiveInvite<T extends InviteColumn>(
		code: string,
		columns: T[],
	): Promise<Pick<Invite, T>> {
		const status: InviteStatus = 'open';
		const data = await this.sql<Array<Pick<Invite, T>>>`
			SELECT ${this.sql(columns as string[])}
			FROM invites WHERE code=${code} AND status=${status}
		`;
		log.debug('found invite', data[0]);
		return data[0];
	}

	//TODO this isn't super generic or reusable, it's basically just for closing the loop on an invite
	async updateInviteByCode(code: string, to_id: AccountId, status: InviteStatus): Promise<Invite> {
		const data = await this.sql<Invite[]>`
			UPDATE invites SET
				to_id=${to_id},
				status=${status},
				updated=NOW()
			WHERE code=${code}
			RETURNING * 
		`;
		log.debug('updated invite', data[0]);
		if (!data.count) throw Error();
		return data[0];
	}
}
