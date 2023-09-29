import type {Task} from '@grogarden/gro';
import {z} from 'zod';

export const Args = z.object({}).strict();
export type Args = z.infer<typeof Args>;

export const task: Task = {
	summary: 'deploy the server to production',
	Args,
	run: async ({invoke_task}) => {
		await invoke_task('infra/setup');
		await invoke_task('infra/deploy');
	},
};
