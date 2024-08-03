import type {Invite} from '$lib/vocab/invite/invite.js';

export type InviteColumn = keyof Invite;
export const INVITE_COLUMNS = {
	all: ['invite_id', 'code', 'status', 'from_id', 'to_id', 'created', 'updated'],
} satisfies Record<string, InviteColumn[]>;
