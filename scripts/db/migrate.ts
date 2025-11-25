import ley from 'ley';
import 'dotenv/config'
import { spawnSync } from 'child_process';

import {MIGRATIONS_DIR_DEV, MIGRATIONS_DIR_PROD} from '../../src/lib/db/migration.js';
import {postgresOptions} from './util'

const BACKUP_FILE = 'backup.sql';
const NODE_ENV = process.env.NODE_ENV;

const PROD = NODE_ENV === "production"

//TODO we assume a dev/build step has already occured & look for .js migration files. Fix after gro dev/build replaced.
const dir = PROD ? MIGRATIONS_DIR_PROD : MIGRATIONS_DIR_DEV;

const status = await ley.status({
	dir,
	driver: 'postgres',
	config: postgresOptions as any,
});

if (!status.length) {
	console.log('no migrations to run');
	process.exit(0);
}

if (PROD) {
	console.log('backing up db');
	spawnSync('sudo', [
		'-i',
		'-u',
		postgresOptions.username,
		'pg_dump',
		postgresOptions.database,
		'-f',
		BACKUP_FILE,
	]);
}

console.log('running migrations: ', status);

const successes = await ley.up({
	dir,
	driver: 'postgres',
	config: postgresOptions as any,
});
console.log('successful migrations:', successes);
if (successes.length !== status.length) {
	throw Error('not all pending migrations were applied, please double check');
}