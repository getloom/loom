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
import {
	checkAccountName,
	checkPasswordStrength,
	scrubAccountName,
} from '$lib/vocab/account/accountHelpers';
import {HUB_COLUMNS} from '$lib/vocab/hub/hubHelpers.server';
import {assertApiError} from '$lib/server/api';

const log = new Logger(gray('[') + blue('accountServices') + gray(']'));

// TODO security considerations, mainly that signup leaks account name existence
// https://github.com/feltjs/felt/pull/525#discussion_r1002323512

export const SignUpService: ServiceByName['SignUp'] = {
	action: SignUp,
	transaction: true,
	perform: async ({repos, params, session, passwordHasher}) => {
		const username = scrubAccountName(params.username);
		assertApiError(checkAccountName(username));

		const existingAccount = await repos.account.findByName(username, ACCOUNT_COLUMNS.account_id);
		if (existingAccount) {
			return {ok: false, status: 409, message: 'account already exists'};
		}

		// check `instance.allowedAccountNames`
		// TODO does this belong in `checkAccountName` above?
		// TODO consider `const settings = repos.entity.filterByUrl('/instance');` (but scoped to admin?)
		if (await repos.hub.hasAdminHub()) {
			const adminHub = await repos.hub.loadAdminHub(HUB_COLUMNS.settings);
			const allowedAccountNames = adminHub!.settings.instance?.allowedAccountNames;
			if (allowedAccountNames) {
				if (!allowedAccountNames.includes(username.toLowerCase())) {
					return {ok: false, status: 400, message: 'cannot create account'};
				}
			}

			const minPasswordLength = adminHub!.settings.instance?.minPasswordLength;
			assertApiError(checkPasswordStrength(params.password, minPasswordLength));
		}

		const account = await repos.account.create(
			passwordHasher,
			username,
			params.password,
			toDefaultAccountSettings(),
			ACCOUNT_COLUMNS.account_id,
		);

		await session.signIn(account.account_id);

		const clientSession = await repos.account.loadClientSession(account.account_id);

		return {ok: true, status: 200, value: {session: clientSession}};
	},
};

export const SignInService: ServiceByName['SignIn'] = {
	action: SignIn,
	transaction: true,
	perform: async ({repos, params, session, passwordHasher}) => {
		const username = scrubAccountName(params.username);
		assertApiError(checkAccountName(username));

		const account = await repos.account.findByName(username, ACCOUNT_COLUMNS.account_id_password);
		if (!account || !(await passwordHasher.verify(params.password, account.password))) {
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
		const updatedAccount = await repos.account.updateSettings(
			account_id,
			params.settings,
			ACCOUNT_COLUMNS.client,
		);
		return {ok: true, status: 200, value: updatedAccount};
	},
};

export const UpdateAccountPasswordService: ServiceByName['UpdateAccountPassword'] = {
	action: UpdateAccountPassword,
	transaction: true,
	perform: async ({repos, account_id, params, passwordHasher}) => {
		const account = await repos.account.findById(account_id, ACCOUNT_COLUMNS.password);
		if (!account) {
			// The `account_id` is authenticated but maybe the account was deleted.
			// Database failures are expected to throw errors, not hit this path.
			return {ok: false, status: 404, message: 'no account found'};
		}

		const adminHub = (await repos.hub.loadAdminHub(HUB_COLUMNS.settings))!;
		assertApiError(
			checkPasswordStrength(params.newPassword, adminHub.settings.instance?.minPasswordLength),
		);

		if (!(await passwordHasher.verify(params.oldPassword, account.password))) {
			// This info-leaking error message is ok because the user is already authenticated
			// to the account, so there's no need to hide its existence with a generic error.
			return {ok: false, status: 400, message: 'incorrect password'};
		}

		const updatedAccount = await repos.account.updatePassword(
			passwordHasher,
			account_id,
			params.newPassword,
			ACCOUNT_COLUMNS.client,
		);
		return {ok: true, status: 200, value: updatedAccount};
	},
};
