import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';
import {unwrap} from '@feltcoop/felt';

import type {ServiceByName} from '$lib/app/eventTypes';
import {UpdateAccountSettings} from '$lib/vocab/account/accountEvents';

const log = new Logger(gray('[') + blue('accountServices') + gray(']'));

export const UpdateAccountSettingsService: ServiceByName['UpdateAccountSettings'] = {
	event: UpdateAccountSettings,
	perform: ({transact, account_id, params}) =>
		transact(async (repos) => {
			log.trace('updating settings for account', account_id, params.settings);
			unwrap(await repos.account.updateSettings(account_id, params.settings));
			return {ok: true, status: 200, value: null};
		}),
};
