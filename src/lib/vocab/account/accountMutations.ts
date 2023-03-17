import type {Mutations} from '$lib/app/eventTypes';
import {gotoUnlessActive, toUrl} from '$lib/ui/url';
import {setIfUpdated} from '$lib/util/store';

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

export const UpdateAccountSettings: Mutations['UpdateAccountSettings'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	setIfUpdated(ui.account, result.value);
	return result;
};

export const UpdateAccountPassword: Mutations['UpdateAccountPassword'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	setIfUpdated(ui.account, result.value);
	return result;
};
