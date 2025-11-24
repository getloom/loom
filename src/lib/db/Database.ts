import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import type {PostgresSql} from '$lib/db/postgres.js';
import {Repos} from '$lib/db/Repos.js';

export interface Options {
	sql: PostgresSql;
}

export class Database implements Disposable {
	readonly sql: PostgresSql;
	readonly repos: Repos;

	readonly log = new Logger(gray('[') + blue('db') + gray(']'));

	constructor({sql}: Options) {
		this.log.info('create');
		this.sql = sql;
		this.repos = new Repos(sql);
	}

	//deprecated, use Symbole dispose below
	async close(): Promise<void> {
		this.log.info('close');
		await this.sql.end();
	}

	[Symbol.dispose]() {
		this.log.info('close');
		this.sql.end();
	}

}
