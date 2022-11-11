import {task as baseTask} from '@feltcoop/gro/dist/typecheck.task.js';

import {initEnv} from '$lib/server/env';

export const task: typeof baseTask = {
	...baseTask,
	run: async ({invokeTask}) => {
		// This is needed so SvelteKit generates types for our environment variables.
		// The env needs to first be initialized,
		// and then SvelteKit needs to sync (which happens in the typecheck task),
		// otherwise CI fails and `gro typecheck` fails from a freshly cloned project.
		initEnv();

		await invokeTask('gro/typecheck');
	},
};
