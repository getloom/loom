import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/util/log.js';
import {unwrap} from '@feltcoop/util';

import type {ServiceByName} from '$lib/app/eventTypes';
import {
	SignUp,
	SignIn,
	SignOut,
	UpdateAccountSettings,
	UpdateAccountPassword,
} from '$lib/vocab/account/accountEvents';
import {toDefaultAccountSettings} from '$lib/vocab/account/accountHelpers.server';
import {checkAccountName, scrubAccountName} from '$lib/vocab/account/accountHelpers';
import {verifyPassword} from '$lib/util/password';
import type {Account} from '$lib/vocab/account/account';
import {ADMIN_COMMUNITY_ID} from '$lib/app/constants';

const log = new Logger(gray('[') + blue('accountServices') + gray(']'));

// TODO security considerations, mainly that signup leaks account name existence
// https://github.com/feltcoop/felt-server/pull/525#discussion_r1002323512

export const SignUpService: ServiceByName['SignUp'] = {
	event: SignUp,
	perform: ({transact, params, session}) =>
		transact(async (repos) => {
			const username = scrubAccountName(params.username);
			const usernameErrorMessage = checkAccountName(username);
			if (usernameErrorMessage) {
				return {ok: false, status: 400, message: usernameErrorMessage};
			}

			const existingAccount = unwrap(await repos.account.findByName(username));
			if (existingAccount) {
				return {ok: false, status: 409, message: 'account already exists'};
			}

			// check `instance.allowedAccountNames`
			// TODO does this belong in `checkAccountName` above?
			// TODO consider `const settings = repos.entity.filterByUrl('/instance');` (but scoped to admin?)
			// should entities be scoped?  or /e/ to reference any path or id?
			const adminCommunity = unwrap(await repos.community.findById(ADMIN_COMMUNITY_ID));
			if (!adminCommunity) throw Error();
			const allowedAccountNames = adminCommunity.settings.instance?.allowedAccountNames;
			if (allowedAccountNames) {
				if (!allowedAccountNames.includes(username.toLowerCase())) {
					return {ok: false, status: 400, message: 'cannot create account'};
				}
			}

			const account = unwrap(
				await repos.account.create(username, params.password, toDefaultAccountSettings()),
			);

			unwrap(session.signIn(account.account_id));

			const clientSession = unwrap(await repos.account.loadClientSession(account.account_id));

			return {ok: true, status: 200, value: {session: clientSession}};
		}),
};

export const SignInService: ServiceByName['SignIn'] = {
	event: SignIn,
	perform: ({transact, params, session}) =>
		transact(async (repos) => {
			const username = scrubAccountName(params.username);
			const usernameErrorMessage = checkAccountName(username);
			if (usernameErrorMessage) {
				return {ok: false, status: 400, message: usernameErrorMessage};
			}

			const account = unwrap(await repos.account.findByName(username));
			if (!account || !(await verifyPassword(params.password, account.password))) {
				return {ok: false, status: 400, message: 'invalid username or password'};
			}

			const clientSession = unwrap(await repos.account.loadClientSession(account.account_id));

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

export const UpdateAccountSettingsService: ServiceByName['UpdateAccountSettings'] = {
	event: UpdateAccountSettings,
	perform: ({transact, account_id, params}) =>
		transact(async (repos) => {
			log.trace('updating settings for account', account_id, params.settings);
			const updatedAccount = unwrap(
				await repos.account.updateSettings(account_id, params.settings),
			);
			return {ok: true, status: 200, value: updatedAccount};
		}),
};

export const UpdateAccountPasswordService: ServiceByName['UpdateAccountPassword'] = {
	event: UpdateAccountPassword,
	perform: ({transact, account_id, params}) =>
		transact(async (repos) => {
			const account = unwrap(
				await repos.account.findById<Pick<Account, 'password'>>(account_id, ['password']),
			);
			if (!account) {
				return {ok: false, status: 404, message: 'account does not exist'};
			}

			if (!(await verifyPassword(params.oldPassword, account.password))) {
				return {ok: false, status: 400, message: 'incorrect password'};
			}

			const updatedAccount = unwrap(
				await repos.account.updatePassword(account_id, params.newPassword),
			);
			return {ok: true, status: 200, value: updatedAccount};
		}),
};
