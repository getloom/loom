import type {Mutations} from '$lib/vocab/action/actionTypes.js';
import {gotoUnlessActive, toUrl} from '$lib/util/url.js';
import {setIfUpdated} from '$lib/util/store.js';

export const SignUp: Mutations['SignUp'] = async ({invoke, actions}) => {
	const result = await invoke();
	if (!result.ok) return result;
	actions.SetSession({session: result.value.session});
	return result;
};

export const SignIn: Mutations['SignIn'] = async ({invoke, actions}) => {
	const result = await invoke();
	if (!result.ok) return result;
	actions.SetSession({session: result.value.session});
	return result;
};

export const SignOut: Mutations['SignOut'] = async ({invoke, actions}) => {
	const result = await invoke();
	if (!result.ok) return result;
	actions.SetSession({session: {guest: true}});
	await gotoUnlessActive(toUrl('/', ''));
	return result;
};

export const UpdateAccountSettings: Mutations['UpdateAccountSettings'] = async ({
	invoke,
	mutate,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	mutate(() => {
		setIfUpdated(ui.account, result.value);
	});
	return result;
};

export const UpdateAccountPassword: Mutations['UpdateAccountPassword'] = async ({
	invoke,
	mutate,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	mutate(() => {
		setIfUpdated(ui.account, result.value);
	});
	return result;
};
