import type {Task} from '@ryanatkn/gro';

export const task: Task = {
	summary: 'test task for invoking from loom frontend',
	run: async ({log}) => {
		log.info("hello world");
	},
};