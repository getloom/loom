import {toObtainable} from '@feltcoop/util/obtainable.js';
import postgres from 'postgres';

import {defaultPostgresOptions} from '$lib/db/postgres.js';
import {Database} from '$lib/db/Database.js';

export const obtainDb = toObtainable(
	(): Database => new Database({sql: postgres(defaultPostgresOptions)}),
	(db): void => {
		void db.close();
	},
);
