import type {Mutations} from '$lib/app/eventTypes';

export const SignUp: Mutations['SignUp'] = async ({invoke, dispatch}) => {
	const result = await invoke();
	if (!result.ok) return result;
	dispatch.SetSession({session: result.value.session});
	return result;
};

export const UpdateAccountSettings: Mutations['UpdateAccountSettings'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const $account = result.value;
	ui.account.set($account);
	return result;
};

export const UpdateAccountPassword: Mutations['UpdateAccountPassword'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const $account = result.value;
	ui.account.set($account);
	return result;
};
