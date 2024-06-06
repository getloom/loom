import type {Mutations} from '$lib/vocab/action/actionTypes.js';

export const RunTask: Mutations['RunTask'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//This is where we would stash results, if there was anything to stash.
	//It'll probably be some kind of "task execution" metadata log shit
	return result;
};
