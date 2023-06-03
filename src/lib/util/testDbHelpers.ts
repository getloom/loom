import postgres from 'postgres';

import {Database} from '$lib/db/Database';
import {defaultPostgresOptions} from '$lib/db/postgres';
import {installSourceMaps, log} from '$lib/util/testHelpers';
import {RandomVocabContext} from '$lib/util/randomVocab';
import type {Repos} from '$lib/db/Repos';

installSourceMaps();

/**
 * The `setupDb` test helper provides a subset of `setupServer` in `testServerHelpers`.
 * If a test suite needs access to `server` or its properties like `websockets` or `broadcast`,
 * use `setupServer` instead of `setupDb`.
 */

// TODO we want to create this once and close it after all tests have run --
// maybe refactor to use the Felt obtainable helper --
// but how can we do that without an error-prone timeout?

export interface TestDbContext {
	db: Database;
	repos: Repos;
	random: RandomVocabContext;
}

export const setupDb = async (context: TestDbContext): Promise<void> => {
	context.db = new Database({sql: postgres(defaultPostgresOptions)});
	context.repos = context.db.repos;
	context.random = new RandomVocabContext(context.repos);
};

export const teardownDb = async (context: TestDbContext): Promise<void> => {
	const {db} = context;
	context.db = null!;
	context.repos = null!;
	context.random = null!;
	try {
		await db.close();
	} catch (err) {
		log.error('error closing db', err);
	}
};

export const testDbCounts = async (repos: Repos): Promise<() => Promise<void>> => {
	const countsBefore = await toDbCounts(repos);
	return async () => {
		const countsAfter = await toDbCounts(repos);
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

export const toDbCounts = async (repos: Repos): Promise<Record<string, number>> => {
	const tableNames = await loadTableNames(repos);
	const query = 'SELECT ' + tableNames.map((n) => `(SELECT count(*) FROM ${n}) AS ${n}`).join(', ');
	const result = await repos.sql.unsafe(query);
	return result[0];
};

// Loads and caches the application's table names in the database.
let _tableNames: string[] | undefined;
const loadTableNames = async (repos: Repos): Promise<string[]> =>
	_tableNames ||
	(_tableNames = (
		await repos.sql.unsafe(
			`SELECT * from pg_catalog.pg_tables
			WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'`,
		)
	)
		.map((v) => v.tablename as string)
		.filter((n) => n !== 'migrations')
		.sort());
