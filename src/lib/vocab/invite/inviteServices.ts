import {blue, gray} from 'kleur/colors';
import {Logger} from '@ryanatkn/belt/log.js';

import type {ServiceByName} from '$lib/vocab/action/actionTypes.js';
import {CreateInvite} from '$lib/vocab/invite/inviteActions.js';
import {INVITE_COLUMNS} from './inviteHelpers.server';

const log = new Logger(gray('[') + blue('accountServices') + gray(']'));

export const CreateInviteService: ServiceByName['CreateInvite'] = {
	action: CreateInvite,
	transaction: true,
	perform: async ({repos, account_id}) => {
		log.debug('creating invite from account', account_id);
		const invite = await repos.invite.create(account_id, INVITE_COLUMNS.all);
		return {ok: true, status: 200, value: {invite}};
	},
};
