import type {Mutations} from '$lib/vocab/action/actionTypes.js';

export const CreateInvite: Mutations['CreateInvite'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO set up store for invites on front end.
	return result;
};
