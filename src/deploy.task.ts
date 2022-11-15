import {task as baseTask} from '@feltcoop/gro/dist/deploy.task.js';

export const task: typeof baseTask = {
	summary: 'deploy the server to production',
	production: true,
	Args: baseTask.Args,
	run: async ({invokeTask}) => {
		await invokeTask('infra/setup');
		await invokeTask('infra/deploy');
		await invokeTask('infra/restartProd');
	},
};
