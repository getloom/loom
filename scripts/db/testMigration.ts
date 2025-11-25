import {rename} from 'node:fs/promises';

import {MIGRATIONS_DIR, find_migrations} from '../../src/lib/db/migration.js';
import { create } from './create';
import { migrate } from './migrate.js';

//TODO this function has some issues related to the src versus dev build versus prod build issue.
// converting all migration files to .js should help fix this.
export async function testMigration(){
		const checkpoint = false;
        const count = 1;

        console.log("Work still needs to be done to swap migration files from .ts to .js for this.");
        return;

		// First move the skipped migration files temporarily out of the migration dir
		// and create the database with seeded data.
		const TEMP_PATH = 'src/lib/db';
		const migration_basepaths = await find_migrations();        
		const migration_basepaths_to_skip = migration_basepaths.slice(-1 * count);
        console.log(migration_basepaths_to_skip)
		await Promise.all(
			migration_basepaths_to_skip.map((basepath) =>
				rename(`${MIGRATIONS_DIR}/${basepath}`, `${TEMP_PATH}/${basepath}`),
			),
		);        

		let err;
		try {
			await create();
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
			await migrate();
		}
	};