import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from 'kleur/colors';
import type {PostgresSql} from '$lib/db/postgres.js';
import {Repos} from '$lib/db/Repos.js';

export interface Options {
	sql: PostgresSql;
}

export class Database {
	readonly sql: PostgresSql;
	readonly repos: Repos;

	readonly log = new Logger(gray('[') + blue('db') + gray(']'));

	constructor({sql}: Options) {
		this.log.info('create');
		this.sql = sql;
		this.repos = new Repos(sql);
	}

	async close(): Promise<void> {
		this.log.info('close');
		await this.sql.end();
	}
}
