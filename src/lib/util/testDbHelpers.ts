import postgres from 'postgres';

import {Database} from '$lib/db/Database';
import {defaultPostgresOptions} from '$lib/db/postgres';
import {installSourceMaps} from '$lib/util/testHelpers';

installSourceMaps();

// TODO we want to create this once and close it after all tests have run --
// maybe refactor to use the Felt obtainable helper --
// but how can we do that without an error-prone timeout?

export interface TestDbContext {
	db: Database;
}

export const setupDb = async (context: TestDbContext): Promise<void> => {
	context.db = new Database({sql: postgres(defaultPostgresOptions)});
};

export const teardownDb = async (context: TestDbContext): Promise<void> => {
	const {db} = context;
	context.db = null!;
	try {
		await db.close();
	} catch (err) {
		console.error('error closing db', err);
	}
};
