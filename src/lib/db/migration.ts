import {stripAfter} from '@feltcoop/util/string.js';

export const MIGRATIONS_PATH = 'lib/db/migrations';
export const MIGRATIONS_DIR = 'src/' + MIGRATIONS_PATH;

/**
 * Extracts the numerical index of the given migraiton file name,
 * of the form `'00000-some-migration-name.ext'`,
 * so `'00011-some-migration-name.ext'` returns `11`.
 * Handles any number of prefixed zeros.
 * @param file
 */
export const toMigrationIndex = (file: string): number => Number(stripAfter(file, '-'));
