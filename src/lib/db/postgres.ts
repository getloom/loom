import type {Sql, Options} from 'postgres';

import {fromEnv} from '$lib/server/env';

// Postgres.js - PostgreSQL client for Node.js
// https://github.com/porsager/postgres

export type PostgresSql = Sql<any>; // TODO type

// was using a type helper here, but worsens usage because of the complexity
export interface PostgresOptions extends Options<any> {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
}

const toDefaultPostgresOptions = (): PostgresOptions => ({
	host: fromEnv('PGHOST'),
	port: Number(fromEnv('PGPORT')),
	database: fromEnv('PGDATABASE'),
	username: fromEnv('PGUSER'),
	password: fromEnv('PGPASSWORD'),
	idle_timeout: Number(fromEnv('PGIDLE_TIMEOUT')) || undefined,
	connect_timeout: Number(fromEnv('PGCONNECT_TIMEOUT')) || undefined,
});

export const defaultPostgresOptions = toDefaultPostgresOptions();
