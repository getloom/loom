import ley from 'ley';
import {defaultPostgresOptions} from '$lib/db/postgres.js';
import type {Logger} from '@feltcoop/util/log.js';

import {MIGRATIONS_DIR} from '$lib/db/migration';

// Note: this requires the dependency `tsm`

export const migrate = async (log: Logger): Promise<void> => {
	const status = await ley.status({
		require: 'tsm',
		dir: MIGRATIONS_DIR,
		driver: 'postgres',
		config: defaultPostgresOptions as any,
	});

	if (!status.length) {
		log.info('no migrations to run');
		return;
	}

	log.info('running migrations: ', status);

	const successes = await ley.up({
		require: 'tsm',
		dir: MIGRATIONS_DIR,
		driver: 'postgres',
		config: defaultPostgresOptions as any,
	});
	log.info('successful migrations:', successes);
	if (successes.length !== status.length) {
		throw Error('not all pending migrations were applied, please double check');
	}
};
