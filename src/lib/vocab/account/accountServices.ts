import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';
import {unwrap} from '@feltcoop/felt';

import type {ServiceByName} from '$lib/app/eventTypes';
import {SignUp, UpdateAccountSettings} from '$lib/vocab/account/accountEvents';
import {toDefaultAccountSettings} from '$lib/vocab/account/account.schema';
import {checkAccountName, scrubAccountName} from '$lib/vocab/account/accountHelpers';

const log = new Logger(gray('[') + blue('accountServices') + gray(']'));

// TODO security considerations
// https://github.com/feltcoop/felt-server/pull/525#discussion_r1002323512

export const SignUpService: ServiceByName['SignUp'] = {
	event: SignUp,
	perform: (serviceRequest) =>
		serviceRequest.transact(async (repos) => {
			const {params, session} = serviceRequest;

			const username = scrubAccountName(params.username);
			const usernameErrorMessage = checkAccountName(username);
			if (usernameErrorMessage) {
				return {ok: false, status: 400, message: usernameErrorMessage};
			}

			const existingAccount = unwrap(await repos.account.findByName(username));
			if (existingAccount) {
				return {ok: false, status: 409, message: 'account already exists'};
			}

			const account = unwrap(
				await repos.account.create(username, params.password, toDefaultAccountSettings()),
			);

			unwrap(session.signIn(account.account_id));

			const clientSession = unwrap(await repos.session.loadClientSession(account.account_id));

			return {ok: true, status: 200, value: {session: clientSession}};
		}),
};

export const UpdateAccountSettingsService: ServiceByName['UpdateAccountSettings'] = {
	event: UpdateAccountSettings,
	perform: ({transact, account_id, params}) =>
		transact(async (repos) => {
			log.trace('updating settings for account', account_id, params.settings);
			unwrap(await repos.account.updateSettings(account_id, params.settings));
			return {ok: true, status: 200, value: null};
		}),
};
