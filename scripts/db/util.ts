import 'dotenv/config'

export const postgresOptions = {
    host: process.env.PGHOST || process.env.POSTGRES_HOST || "",
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE || process.env.POSTGRES_DB || "",
    username: process.env.PGUSER || "",
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || "",
    idle_timeout: Number(process.env.PGIDLE_TIMEOUT) || undefined,
    connect_timeout: Number(process.env.PGCONNECT_TIMEOUT) || undefined,
}   