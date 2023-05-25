import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltjs/util/log.js';

import type {ServiceByName} from '$lib/vocab/action/actionTypes';
import {
	SignUp,
	SignIn,
	SignOut,
	UpdateAccountSettings,
	UpdateAccountPassword,
} from '$lib/vocab/account/accountActions';
import {ACCOUNT_COLUMNS, toDefaultAccountSettings} from '$lib/vocab/account/accountHelpers.server';
import {checkAccountName, scrubAccountName} from '$lib/vocab/account/accountHelpers';
import {verifyPassword} from '$lib/util/password';

const log = new Logger(gray('[') + blue('accountServices') + gray(']'));

// TODO security considerations, mainly that signup leaks account name existence
// https://github.com/feltjs/felt-server/pull/525#discussion_r1002323512

export const SignUpService: ServiceByName['SignUp'] = {
	action: SignUp,
	transaction: true,
	perform: async ({repos, params, session}) => {
		const username = scrubAccountName(params.username);
		const usernameErrorMessage = checkAccountName(username);
		if (usernameErrorMessage) {
			return {ok: false, status: 400, message: usernameErrorMessage};
		}

		const existingAccount = await repos.account.findByName(username);
		if (existingAccount) {
			return {ok: false, status: 409, message: 'account already exists'};
		}

		// check `instance.allowedAccountNames`
		// TODO does this belong in `checkAccountName` above?
		// TODO consider `const settings = repos.entity.filterByUrl('/instance');` (but scoped to admin?)
		// should entities be scoped?  or /e/ to reference any path or id?
		if (await repos.hub.hasAdminHub()) {
			const adminHub = await repos.hub.loadAdminHub();
			const allowedAccountNames = adminHub!.settings.instance?.allowedAccountNames;
			if (allowedAccountNames) {
				if (!allowedAccountNames.includes(username.toLowerCase())) {
					return {ok: false, status: 400, message: 'cannot create account'};
				}
			}
		}

		const account = await repos.account.create(
			username,
			params.password,
			toDefaultAccountSettings(),
		);

		await session.signIn(account.account_id);

		const clientSession = await repos.account.loadClientSession(account.account_id);

		return {ok: true, status: 200, value: {session: clientSession}};
	},
};

export const SignInService: ServiceByName['SignIn'] = {
	action: SignIn,
	transaction: true,
	perform: async ({repos, params, session}) => {
		const username = scrubAccountName(params.username);
		const usernameErrorMessage = checkAccountName(username);
		if (usernameErrorMessage) {
			return {ok: false, status: 400, message: usernameErrorMessage};
		}

		const account = await repos.account.findByName(username);
		if (!account || !(await verifyPassword(params.password, account.password))) {
			return {ok: false, status: 400, message: 'invalid username or password'};
		}

		const clientSession = await repos.account.loadClientSession(account.account_id);

		await session.signIn(account.account_id);

		return {ok: true, status: 200, value: {session: clientSession}};
	},
};

export const SignOutService: ServiceByName['SignOut'] = {
	action: SignOut,
	transaction: false,
	perform: async ({session}) => {
		await session.signOut();
		return {ok: true, status: 200, value: null};
	},
};

export const UpdateAccountSettingsService: ServiceByName['UpdateAccountSettings'] = {
	action: UpdateAccountSettings,
	transaction: true,
	perform: async ({repos, account_id, params}) => {
		log.debug('updating settings for account', account_id, params.settings);
		const updatedAccount = await repos.account.updateSettings(account_id, params.settings);
		return {ok: true, status: 200, value: updatedAccount};
	},
};

export const UpdateAccountPasswordService: ServiceByName['UpdateAccountPassword'] = {
	action: UpdateAccountPassword,
	transaction: true,
	perform: async ({repos, account_id, params}) => {
		const account = await repos.account.findById(account_id, ACCOUNT_COLUMNS.Password);
		if (!account) {
			return {ok: false, status: 404, message: 'account does not exist'};
		}

		if (!(await verifyPassword(params.oldPassword, account.password))) {
			return {ok: false, status: 400, message: 'incorrect password'};
		}

		const updatedAccount = await repos.account.updatePassword(account_id, params.newPassword);
		return {ok: true, status: 200, value: updatedAccount};
	},
};
