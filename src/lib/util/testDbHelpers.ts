import postgres from 'postgres';

import {Database} from '$lib/db/Database';
import {defaultPostgresOptions} from '$lib/db/postgres';
import {installSourceMaps, log} from '$lib/util/testHelpers';
import {RandomVocabContext} from '$lib/util/randomVocab';

installSourceMaps();

// TODO we want to create this once and close it after all tests have run --
// maybe refactor to use the Felt obtainable helper --
// but how can we do that without an error-prone timeout?

export interface TestDbContext {
	db: Database;
	random: RandomVocabContext;
}

export const setupDb = async (context: TestDbContext): Promise<void> => {
	context.db = new Database({sql: postgres(defaultPostgresOptions)});
	context.random = new RandomVocabContext(context.db);
};

export const teardownDb = async (context: TestDbContext): Promise<void> => {
	const {db} = context;
	context.db = null!;
	try {
		await db.close();
	} catch (err) {
		log.error('error closing db', err);
	}
};

export const testDbCounts = async (db: Database): Promise<() => Promise<void>> => {
	const countsBefore = await toDbCounts(db);
	return async () => {
		const countsAfter = await toDbCounts(db);
		let errorMessage = '';
		for (const tableName in countsAfter) {
			const before = countsBefore[tableName];
			const after = countsAfter[tableName];
			const diff = after - before;
			if (diff) {
				errorMessage += `\n${tableName}: ${diff > 0 ? '+' : '-'}${diff}`;
			}
		}
		if (errorMessage) {
			throw Error(`Database row counts changed unexpectedly:\n${errorMessage}`);
		}
	};
};

export const toDbCounts = async (db: Database): Promise<Record<string, number>> => {
	const tableNames = await loadTableNames(db);
	const query = 'SELECT ' + tableNames.map((n) => `(SELECT count(*) FROM ${n}) AS ${n}`).join(', ');
	const result = await db.sql.unsafe(query);
	return result[0];
};

// Loads and caches the application's table names in the database.
let _tableNames: string[] | undefined;
const loadTableNames = async (db: Database): Promise<string[]> =>
	_tableNames ||
	(_tableNames = (
		await db.sql.unsafe(
			`SELECT * from pg_catalog.pg_tables
			WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'`,
		)
	)
		.map((v) => v.tablename as string)
		.filter((n) => n !== 'migrations')
		.sort());
