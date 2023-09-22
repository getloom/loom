import {create_obtainable} from '@grogarden/util/obtainable.js';
import postgres from 'postgres';

import {defaultPostgresOptions} from '$lib/db/postgres';
import {Database} from '$lib/db/Database';

export const obtainDb = create_obtainable(
	(): Database => new Database({sql: postgres(defaultPostgresOptions)}),
	(db): void => {
		void db.close();
	},
);
