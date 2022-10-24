import {unwrap} from '@feltcoop/felt';

import {verifyPassword} from '$lib/util/password';
import {SignIn, SignOut} from '$lib/session/sessionEvents';
import type {ServiceByName} from '$lib/app/eventTypes';
import {checkAccountName, scrubAccountName} from '$lib/vocab/account/accountHelpers';

// TODO security considerations
// https://github.com/feltcoop/felt-server/pull/525#discussion_r1002323512

export const SignInService: ServiceByName['SignIn'] = {
	event: SignIn,
	perform: (serviceRequest) =>
		serviceRequest.transact(async (repos) => {
			const {params, session} = serviceRequest;

			const username = scrubAccountName(params.username);
			const usernameErrorMessage = checkAccountName(username);
			if (usernameErrorMessage) {
				return {ok: false, status: 400, message: usernameErrorMessage};
			}

			const account = unwrap(await repos.account.findByName(username));
			if (!account) {
				return {ok: false, status: 400, message: 'account does not exist'};
			}

			if (!(await verifyPassword(params.password, account.password))) {
				return {ok: false, status: 400, message: 'incorrect password'};
			}

			const clientSession = unwrap(await repos.session.loadClientSession(account.account_id));

			unwrap(session.signIn(account.account_id));

			return {ok: true, status: 200, value: {session: clientSession}};
		}),
};

export const SignOutService: ServiceByName['SignOut'] = {
	event: SignOut,
	perform: async ({session}) => {
		unwrap(session.signOut());
		return {ok: true, status: 200, value: null};
	},
};
