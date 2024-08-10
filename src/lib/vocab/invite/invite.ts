import type {Flavored} from '@ryanatkn/belt/types.js';
import type {AccountId} from '$lib/vocab/account/account';

export type InviteId = Flavored<number, 'InviteId'>;
//OPEN : an invite has been created and is redeemable
//CLOSED : an invite was created but has been revoked [UNIMPLEMENTED]
//COMPLETED : an invite was used to create an account & should have a to_id set
//EXPIRED : an invite was opened, but was not utilized before a window closed [UNIMPLEMENTED]
export type InviteStatus = 'open' | 'closed' | 'completed' | 'expired';

export const CODE_PARAM = 'code';

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
