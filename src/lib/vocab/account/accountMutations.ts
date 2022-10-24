import type {Mutations} from '$lib/app/eventTypes';

export const SignUp: Mutations['SignUp'] = async ({invoke, dispatch}) => {
	const result = await invoke();
	if (!result.ok) return result;
	dispatch.SetSession({session: result.value.session});
	return result;
};

export const UpdateAccountSettings: Mutations['UpdateAccountSettings'] = async ({
	params,
	invoke,
	ui: {account},
}) => {
	// optimistic update
	const originalSettings = account.get()!.settings;
	account.update(($account) => ({
		...$account!,
		settings: {...$account!.settings, ...params.settings},
	}));
	const result = await invoke();
	if (!result.ok) {
		account.update(($account) => ({...$account!, settings: originalSettings}));
	}
	return result;
};
