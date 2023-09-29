import type {Sql, Options} from 'postgres';
import {
	PGHOST,
	PGPORT,
	PGDATABASE,
	PGUSER,
	PGPASSWORD,
	PGIDLE_TIMEOUT,
	PGCONNECT_TIMEOUT,
} from '$env/static/private';

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
	host: PGHOST,
	port: Number(PGPORT),
	database: PGDATABASE,
	username: PGUSER,
	password: PGPASSWORD,
	idle_timeout: Number(PGIDLE_TIMEOUT) || undefined,
	connect_timeout: Number(PGCONNECT_TIMEOUT) || undefined,
});

export const defaultPostgresOptions = toDefaultPostgresOptions();
