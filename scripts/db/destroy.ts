import postgres from 'postgres';
import {PostgresOptions} from '../../src/lib/db/postgres.js'
import 'dotenv/config'

export const postgresOptions: PostgresOptions = {
    host: process.env.PGHOST || "",
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE || "",
    username: process.env.PGUSER || "",
    password: process.env.PGPASSWORD || "",
    idle_timeout: Number(process.env.PGIDLE_TIMEOUT) || undefined,
    connect_timeout: Number(process.env.PGCONNECT_TIMEOUT) || undefined,
}   

const db = postgres(postgresOptions)

await db.unsafe(`
        drop schema public cascade;
        create schema public;
        alter schema public owner to postgres;
        grant all on schema public to postgres;
        grant all on schema public to ${postgresOptions.username};
        grant all on schema public to public;
    `);

db.end();