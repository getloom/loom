import type {Mutations} from '$lib/app/eventTypes';
import {gotoUnlessActive, toUrl} from '$lib/ui/url';
import {setIfUpdated} from '$lib/util/store';

export const SignUp: Mutations['SignUp'] = async ({invoke, dispatch}) => {
	const result = await invoke();
	if (!result.ok) return result;
	dispatch.SetSession({session: result.value.session});
	return result;
};

export const SignIn: Mutations['SignIn'] = async ({invoke, dispatch}) => {
	const result = await invoke();
	if (!result.ok) return result;
	dispatch.SetSession({session: result.value.session});
	return result;
};

export const SignOut: Mutations['SignOut'] = async ({invoke, dispatch}) => {
	const result = await invoke();
	if (!result.ok) return result;
	dispatch.SetSession({session: {guest: true}});
	await gotoUnlessActive(toUrl('/', ''));
	return result;
};

export const UpdateAccountSettings: Mutations['UpdateAccountSettings'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const $account = result.value;
	setIfUpdated(ui.account, $account);
	return result;
};

export const UpdateAccountPassword: Mutations['UpdateAccountPassword'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const $account = result.value;
	setIfUpdated(ui.account, $account);
	return result;
};
