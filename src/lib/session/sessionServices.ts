import {verifyPassword} from '$lib/util/password';
import {SignIn, SignOut} from '$lib/session/sessionEvents';
import type {ServiceByName} from '$lib/app/eventTypes';
import {toDefaultAccountSettings} from '$lib/vocab/account/account.schema';
import {unwrap} from '@feltcoop/felt';

export const SignInService: ServiceByName['SignIn'] = {
	event: SignIn,
	perform: (serviceRequest) =>
		serviceRequest.transact(async (repos) => {
			const {
				params: {username, password},
				session,
			} = serviceRequest;

			// If the browser session is out of sync with the server,
			// the client may think it's signed out when the server sees a session.
			// To avoid bugs and confusion, this logs out the user and asks them to try again.
			if ('account_id' in serviceRequest) {
				session.signOut();
				return {ok: false, status: 400, message: 'something went wrong, please try again'};
			}

			// First see if the account already exists.
			let account = unwrap(await repos.account.findByName(username));
			if (account) {
				// There's already an account, so proceed to sign in after validating the password.
				if (!(await verifyPassword(password, account.password))) {
					return {ok: false, status: 400, message: 'invalid account name or password'};
				}
			} else {
				// There's no account, so create one.
				// TODO this flow is temporary, we'll make account creation explicit instead of implicit
				const createAccountResult = await repos.account.create(
					username,
					password,
					toDefaultAccountSettings(),
				);
				if (createAccountResult.ok) {
					account = createAccountResult.value;
				} else {
					// Failed to create the account.
					return {ok: false, status: 500, message: 'failed to create account'};
				}
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
