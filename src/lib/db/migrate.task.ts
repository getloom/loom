import type {Task} from '@feltcoop/gro';

import {migrate} from '$lib/db/migrate';

export const task: Task = {
	summary: 'running new migrations to bring database up to date',
	run: async ({log}) => {
		await migrate(log);
	},
};
