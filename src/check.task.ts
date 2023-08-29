import type {Task} from '@feltjs/gro';
import {z} from 'zod';

import {MIGRATIONS_DIR, toMigrationIndex} from '$lib/db/migration';

const Args = z
	.object({
		// base args -- TODO extend generically, `import {Args as BaseArgs} from '@feltjs/gro/dist/check.task.js';`
		typecheck: z.boolean({description: ''}).default(true),
		'no-typecheck': z.boolean({description: 'opt out of typechecking'}).default(false),
		test: z.boolean({description: ''}).default(true),
		'no-test': z.boolean({description: 'opt out of running tests'}).default(false),
		gen: z.boolean({description: ''}).default(true),
		'no-gen': z.boolean({description: 'opt out of gen check'}).default(false),
		format: z.boolean({description: ''}).default(true),
		'no-format': z.boolean({description: 'opt out of format check'}).default(false),
		lint: z.boolean({description: ''}).default(true),
		'no-lint': z.boolean({description: 'opt out of linting'}).default(false),
		// added by this project
		migrations: z.boolean({description: ''}).default(true),
		'no-migrations': z.boolean({description: 'opt out of migrations check'}).default(false),
	})
	.strict();
type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	summary: 'runs gro check with additional checks for this repo',
	Args,
	run: async ({invokeTask, fs, args, log}) => {
		const {migrations, 'no-migrations': noMigrations, ...restArgs} = args;

		// Check that migration files are properly numbered.
		if (migrations) {
			log.info('checking migrations');
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
