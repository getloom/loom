import {task as base_task} from '@grogarden/gro/sync.task.js';

export const task: typeof base_task = {
	...base_task,
	run: async ({invoke_task, args}) => {
		await invoke_task('infra/syncEnvGitHash');
		return invoke_task('gro/sync', args);
	},
};
