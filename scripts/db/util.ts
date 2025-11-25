import 'dotenv/config'

export const postgresOptions = {
    host: process.env.PGHOST || "",
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE || "",
    username: process.env.PGUSER || "",
    password: process.env.PGPASSWORD || "",
    idle_timeout: Number(process.env.PGIDLE_TIMEOUT) || undefined,
    connect_timeout: Number(process.env.PGCONNECT_TIMEOUT) || undefined,
}   