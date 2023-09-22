import {strip_after} from '@grogarden/util/string.js';
import {readdir} from 'node:fs/promises';

import type {Basepath} from '$lib/util/fs';

export const MIGRATIONS_PATH = 'lib/db/migrations';
export const MIGRATIONS_DIR = 'src/' + MIGRATIONS_PATH;
export const MIGRATIONS_DIR_PROD = 'dist/server/' + MIGRATIONS_PATH;

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
