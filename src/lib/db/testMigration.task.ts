import type {Task} from '@ryanatkn/gro';
import {z} from 'zod';
import {rename} from 'node:fs/promises';

import {MIGRATIONS_DIR, find_migrations} from '$lib/db/migration.js';

const Args = z
	.object({
		checkpoint: z
			.boolean({description: 'if `true`, does not run the `count` number of final migrations'})
			.default(false),
		count: z
			.number({description: 'number of migrations being tested; rarely might need more than 1'})
			.default(1),
	})
	.strict();
type Args = z.infer<typeof Args>;

export const task: Task<Args> = {
	summary: 'tests the most recent mogration file against the seeded database',
	Args,
	run: async ({invoke_task, args}) => {
		const {checkpoint, count} = args;

		// First move the skipped migration files temporarily out of the migration dir
		// and create the database with seeded data.
		const TEMP_PATH = 'src/lib/db';
		const migration_basepaths = await find_migrations();
		const migration_basepaths_to_skip = migration_basepaths.slice(-1 * count);
		await Promise.all(
			migration_basepaths_to_skip.map((basepath) =>
				rename(`${MIGRATIONS_DIR}/${basepath}`, `${TEMP_PATH}/${basepath}`),
			),
		);

		let err;
		try {
			await invoke_task('db/create');
		} catch (_err) {
			err = _err;
		}

		// Move the files back.
		await Promise.all(
			migration_basepaths_to_skip.map((basepath) =>
				rename(`${TEMP_PATH}/${basepath}`, `${MIGRATIONS_DIR}/${basepath}`),
			),
		);

		// Throw any error that occurred, but only after moving the file back.
		if (err) throw err;

		if (!checkpoint) {
			await invoke_task('db/migrate');
		}
	},
};
