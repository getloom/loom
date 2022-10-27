import {task as baseTask} from '@feltcoop/gro/dist/dev.task.js';

export const task: typeof baseTask = {
	summary: 'start dev server',
	Args: baseTask.Args,
	run: async ({invokeTask}) => {
		await invokeTask('infra/updateEnv');
		return invokeTask('gro/dev');
	},
};
