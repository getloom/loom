import type {Task} from '@grogarden/gro';

import {migrate} from '$lib/db/migrate';

export const task: Task = {
	summary: 'runs any new migrations to bring database up to date',
	run: async ({log, invoke_task}) => {
		// build everything including the migration files so `ley` has the `.js`
		await invoke_task('dev', {watch: false});

		await migrate(false, log);
	},
};
