import type {Flavored} from '@ryanatkn/belt/types.js';
import type {AccountId} from '$lib/vocab/account/account';

export type InviteId = Flavored<number, 'InviteId'>;
export type InviteStatus = 'open' | 'closed' | 'completed' | 'expired';

/**
 * Represents an invitation from one account to another for closed instances.
 */
export interface Invite {
	invite_id: InviteId;
	code: string;
	status: InviteStatus;
	from_id: AccountId;
	to_id: AccountId | null;
	created: Date;
	updated: Date | null;
}
