import {blue, gray} from 'kleur/colors';
import type {Repos} from '$lib/db/Repos';
import type {Invite} from '$lib/vocab/invite/invite.js';
import {Logger} from '@ryanatkn/belt/log.js';

export type InviteColumn = keyof Invite;
export const INVITE_COLUMNS = {
	all: ['invite_id', 'code', 'status', 'from_id', 'to_id', 'created', 'updated'],
} satisfies Record<string, InviteColumn[]>;

const log = new Logger(gray('[') + blue('inviteHelpers.server') + gray(']'));

const UUID_MATCHER = /^[0-9a-f-]*$/u;

//TODO BLOCK write tests for this
export const isValidCode = async (repos: Repos, code: string): Promise<boolean> => {
	if (!UUID_MATCHER.test(code)) {
		log.warn('code failed regex validation', code);
		return false;
	} else {
		const result = await repos.invite.findActiveInvite(code, INVITE_COLUMNS.all);
		if (result) {
			return true;
		} else {
			log.warn('no open invite found for code', code);
			return false;
		}
	}
};
