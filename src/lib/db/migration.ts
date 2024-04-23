import {strip_after} from '@ryanatkn/belt/string.js';
import {readdir} from 'node:fs/promises';

import type {Basepath} from '$lib/util/fs.js';

// TODO these use some variables from gro but that causes a runtime dependency,
// so for now we're just hardcoding them (we may use gro at runtime, but not for this)
export const MIGRATIONS_DIR = 'src/lib/db/migrations';
export const MIGRATIONS_DIR_PROD = 'dist_server/db/migrations';
export const MIGRATIONS_DIR_DEV = '.gro/dev/db/migrations';
/**
 * Extracts the numerical index of a migration file name,
 * stripping any number of prefixed zeros.
 * @param basepath - the base file name of the form `'00000-some-migration-name.ext'`
 * @returns the integer portion of the `basepath`, so `'00011-some-migration-name.ext'` returns `11`
 */
export const to_migration_index = (basepath: Basepath): number =>
	Number(strip_after(basepath, '-'));

/**
 * Returns the sorted list of migration file basepaths in `dir`.
 */
export const find_migrations = async (dir = MIGRATIONS_DIR): Promise<Basepath[]> =>
	(await readdir(dir)).sort();
