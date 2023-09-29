import ley from 'ley';
import type {Logger} from '@grogarden/util/log.js';
import {spawn} from '@grogarden/util/process.js';

import {defaultPostgresOptions} from '$lib/db/postgres';
import {MIGRATIONS_DIR_DEV, MIGRATIONS_DIR_PROD} from '$lib/db/migration';

const BACKUP_FILE = 'backup.sql';

export const migrate = async (prod: boolean, log: Logger): Promise<void> => {
	const dir = prod ? MIGRATIONS_DIR_PROD : MIGRATIONS_DIR_DEV;

	const status = await ley.status({
		dir,
		driver: 'postgres',
		config: defaultPostgresOptions as any,
	});

	if (!status.length) {
		log.info('no migrations to run');
		return;
	}

	if (prod) {
		log.info('backing up db');
		await spawn('sudo', [
			'-i',
			'-u',
			defaultPostgresOptions.username,
			'pg_dump',
			defaultPostgresOptions.database,
			'-f',
			BACKUP_FILE,
		]);
	}

	log.info('running migrations: ', status);

	const successes = await ley.up({
		dir,
		driver: 'postgres',
		config: defaultPostgresOptions as any,
	});
	log.info('successful migrations:', successes);
	if (successes.length !== status.length) {
		throw Error('not all pending migrations were applied, please double check');
	}
};
