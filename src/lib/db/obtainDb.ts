import {toObtainable} from '@feltjs/util/obtainable.js';
import postgres from 'postgres';

import {defaultPostgresOptions} from '$lib/db/postgres';
import {Database} from '$lib/db/Database';

export const obtainDb = toObtainable(
	(): Database => new Database({sql: postgres(defaultPostgresOptions)}),
	(db): void => {
		void db.close();
	},
);
