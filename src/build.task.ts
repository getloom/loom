import {task as baseTask} from '@feltcoop/gro/dist/build.task.js';

export const task: typeof baseTask = {
	summary: baseTask.summary,
	Args: baseTask.Args,
	production: true,
	run: async ({invokeTask}) => {
		await invokeTask('lib/infra/syncEnvGitHash');
		return invokeTask('gro/build');
	},
};
