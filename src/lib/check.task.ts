import type {Task} from '@ryanatkn/gro';
import {z} from 'zod';
import {task as baseTask, Args as BaseArgs} from '@ryanatkn/gro/check.task.js';

import {find_migrations, to_migration_index} from '$lib/db/migration.js';

export const Args = BaseArgs.extend({
	migrations: z.boolean({description: 'dual of no-migrations'}).default(true),
	'no-migrations': z.boolean({description: 'opt out of migrations check'}).default(false),
}).strict();
export type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	...baseTask,
	Args,
	run: async ({invoke_task, args, log}) => {
		const {migrations, 'no-migrations': noMigrations, ...restArgs} = args;

		// Check that migration files are properly numbered.
		if (migrations) {
			log.info('checking migrations');
			const migration_basepaths = await find_migrations();
			for (let i = 0; i < migration_basepaths.length; i++) {
				const migration_basepath = migration_basepaths[i];
				const migration_index = to_migration_index(migration_basepath);
				if (i !== migration_index) {
					throw Error(
						'Migration named index does not match its directory index.' +
							` Expected index '${i}' but got '${migration_index}' for file ${migration_basepath}`,
					);
				}
			}
		}

		// Perform default checks.
		await invoke_task('gro/check', restArgs);
	},
};
