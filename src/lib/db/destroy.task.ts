import type {Task} from '@grogarden/gro';

import {obtainDb} from '$lib/db/obtainDb';
import {defaultPostgresOptions} from '$lib/db/postgres';

export const task: Task = {
	summary: 'destroy the app database schema and delete all data',
	run: async () => {
		const [db, unobtainDb] = obtainDb();
		await db.sql.unsafe(`
			drop schema public cascade;
			create schema public;
			alter schema public owner to postgres;
			grant all on schema public to postgres;
			grant all on schema public to ${defaultPostgresOptions.username};
			grant all on schema public to public;
		`);
		unobtainDb();
	},
};
