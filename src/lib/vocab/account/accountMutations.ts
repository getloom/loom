import type {Mutations} from '$lib/app/eventTypes';

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
