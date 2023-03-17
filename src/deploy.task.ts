import {task as baseTask} from '@feltjs/gro/dist/deploy.task.js';

export const task: typeof baseTask = {
	summary: 'deploy the server to production',
	production: true,
	Args: baseTask.Args,
	run: async ({invokeTask}) => {
		await invokeTask('lib/infra/setup');
		await invokeTask('lib/infra/deploy');
	},
};
