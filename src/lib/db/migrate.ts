import ley from 'ley';
import {defaultPostgresOptions} from '$lib/db/postgres.js';
import type {Logger} from '@feltcoop/util/log.js';

import {MIGRATIONS_DIR, MIGRATIONS_DIR_PROD} from '$lib/db/migration';

// Note: this requires the dependency `tsm`

export const migrate = async (prod: boolean, log: Logger): Promise<void> => {
	const dir = prod ? MIGRATIONS_DIR_PROD : MIGRATIONS_DIR;

	const status = await ley.status({
		require: prod ? undefined : 'tsm',
		dir,
		driver: 'postgres',
		config: defaultPostgresOptions as any,
	});

	if (!status.length) {
		log.info('no migrations to run');
		return;
	}

	log.info('running migrations: ', status);

	const successes = await ley.up({
		require: prod ? undefined : 'tsm',
		dir,
		driver: 'postgres',
		config: defaultPostgresOptions as any,
	});
	log.info('successful migrations:', successes);
	if (successes.length !== status.length) {
		throw Error('not all pending migrations were applied, please double check');
	}
};
