import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import {PostgresRepo} from '$lib/db/PostgresRepo.js';
import type {AccountId} from '$lib/vocab/account/account.js';
import type {InviteColumn} from '$lib/vocab/invite/inviteHelpers.server.js';
import type {Invite, InviteStatus} from '$lib/vocab/invite/invite.js';

const log = new Logger(gray('[') + blue('InviteRepo') + gray(']'));

export class InviteRepo extends PostgresRepo {
	async create<T extends InviteColumn>(
		invitingAccount: AccountId,
		columns: T[],
	): Promise<Pick<Invite, T>> {
		const code = '1234'; //UUID gen
		const status: InviteStatus = 'open';
		const data = await this.sql<Array<Pick<Invite, T>>>`
			INSERT INTO invites (code, status, from_id) VALUES (
				${code}, ${status}, ${invitingAccount}
			) RETURNING ${this.sql(columns as string[])}
		`;
		log.debug('created account', data[0]);
		return data[0];
	}
}
