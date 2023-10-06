import type {PostgresSql} from '$lib/db/postgres.js';
import type {Repos} from '$lib/db/Repos.js';

export class PostgresRepo {
	constructor(
		public readonly repos: Repos,
		public readonly sql: PostgresSql,
	) {}
}
