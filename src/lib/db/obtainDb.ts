import {create_obtainable} from '@grogarden/util/obtainable.js';
import postgres from 'postgres';

import {defaultPostgresOptions} from '$lib/db/postgres.js';
import {Database} from '$lib/db/Database.js';

export const obtainDb = create_obtainable(
	(): Database => new Database({sql: postgres(defaultPostgresOptions)}),
	(db): void => {
		void db.close();
	},
);
