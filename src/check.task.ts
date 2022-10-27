import type {Task} from '@feltcoop/gro';
import {z} from 'zod';

import {MIGRATIONS_DIR, toMigrationIndex} from '$lib/db/migration';

const Args = z
	.object({
		// base args -- TODO do this automatically, `import {task as baseTask} from '@feltcoop/gro/dist/check.task.js';`
		typecheck: z.boolean({description: ''}).optional().default(true),
		'no-typecheck': z.boolean({description: 'opt out of typechecking'}).optional().default(false),
		test: z.boolean({description: ''}).optional().default(true),
		'no-test': z.boolean({description: 'opt out of running tests'}).optional().default(false),
		gen: z.boolean({description: ''}).optional().default(true),
		'no-gen': z.boolean({description: 'opt out of gen check'}).optional().default(false),
		format: z.boolean({description: ''}).optional().default(true),
		'no-format': z.boolean({description: 'opt out of format check'}).optional().default(false),
		lint: z.boolean({description: ''}).optional().default(true),
		'no-lint': z.boolean({description: 'opt out of linting'}).optional().default(false),
		// added by this project
		migrations: z.boolean({description: ''}).optional().default(true),
		'no-migrations': z
			.boolean({description: 'opt out of migrations check'})
			.optional() // TODO behavior differs now with zod, because of `default` this does nothing (above too)
			.default(false),
	})
	.strict();
type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	summary: 'runs gro check with additional checks for this repo',
	Args,
	run: async ({invokeTask, fs, args, log}) => {
		const {migrations, 'no-migrations': noMigrations, ...restArgs} = args;
		if (migrations) {
			log.info('checking migrations');
			// Check migration files are properly numbered.
			const migrationFiles = (await fs.readDir(MIGRATIONS_DIR)).sort();
			for (let i = 0; i < migrationFiles.length; i++) {
				const migrationFile = migrationFiles[i];
				const migrationIndex = toMigrationIndex(migrationFile);
				if (i !== migrationIndex) {
					throw Error(
						'Migration named index does not match its directory index.' +
							` Expected index '${i}' but got '${migrationIndex}' for file ${migrationFile}`,
					);
				}
			}
		}

		// Perform default checks.
		await invokeTask('gro/check', restArgs);
	},
};
