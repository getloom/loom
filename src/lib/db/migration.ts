import {stripAfter} from '@feltjs/util/string.js';

export const MIGRATIONS_PATH = 'lib/db/migrations';
export const MIGRATIONS_DIR = 'src/' + MIGRATIONS_PATH;
export const MIGRATIONS_DIR_PROD = 'dist/server/' + MIGRATIONS_PATH;

/**
 * Extracts the numerical index of a migration file name,
 * stripping any number of prefixed zeros.
 * @param file - The file name of the form `'00000-some-migration-name.ext'`
 * @returns The integer portion of the filename, so `'00011-some-migration-name.ext'` returns `11`
 */
export const toMigrationIndex = (file: string): number => Number(stripAfter(file, '-'));
