import type {Task} from '@feltjs/gro';
import {z} from 'zod';

import {MIGRATIONS_DIR} from '$lib/db/migration';

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
	run: async ({invokeTask, fs, args}) => {
		const {checkpoint, count} = args;

		// First move the skipped migration files temporarily out of the migration dir
		// and create the database with seeded data.
		const TEMP_PATH = 'src/lib/db';
		const migrationFiles = (await fs.readDir(MIGRATIONS_DIR)).sort();
		const migrationFilesToSkip = migrationFiles.slice(-1 * count);
		await Promise.all(
			migrationFilesToSkip.map((file) =>
				fs.move(`${MIGRATIONS_DIR}/${file}`, `${TEMP_PATH}/${file}`),
			),
		);

		let err;
		try {
			await invokeTask('lib/db/create');
		} catch (_err) {
			err = _err;
		}

		// Move the files back.
		await Promise.all(
			migrationFilesToSkip.map((file) =>
				fs.move(`${TEMP_PATH}/${file}`, `${MIGRATIONS_DIR}/${file}`),
			),
		);

		// Throw any error that occurred, but only after moving the file back.
		if (err) throw err;

		if (!checkpoint) {
			await invokeTask('lib/db/migrate');
		}
	},
};
