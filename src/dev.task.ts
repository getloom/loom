import {task as baseTask} from '@feltjs/gro/dist/dev.task.js';

export const task: typeof baseTask = {
	summary: baseTask.summary,
	Args: baseTask.Args,
	run: async ({invokeTask}) => {
		await invokeTask('lib/infra/syncEnvGitHash');
		return invokeTask('gro/dev');
	},
};
