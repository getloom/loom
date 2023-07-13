# Database docs

## Dependencies

- [PostgreSQL](https://www.postgresql.org)
- [`postgres`](https://github.com/porsager/postgres)
- [Ley](https://github.com/lukeed/ley)

## Postgres setup

The Felt server has a dependency on [PostgreSQL](https://www.postgresql.org) 15+.
You can find [setup instructions](https://www.postgresql.org/download/) on their website.

Felt's database driver is [`postgres`](https://github.com/porsager/postgres).
See its [README](https://github.com/porsager/postgres#readme) to learn more.

At the moment, the server [defaults to connecting](./postgres.ts)
to the database with the following values,
prioritizing [environment variables](https://vitejs.dev/guide/env-and-mode.html#env-variables)
if they're defined:

```
database = PGDATABASE or 'felt'
username = PGUSERNAME or PGUSER or 'postgres'
password = PGPASSWORD or 'password'
host = PGHOST or 'localhost'
port = PGPORT or 5432
idle_timeout = PGIDLE_TIMEOUT
connect_timeout = PGCONNECT_TIMEOUT
```

To set up the database with the expected defaults:

```bash
sudo -u postgres psql
# in psql:
# postgres=#
create database felt; # notice the semicolon
\password
<enter "password">
```

> TODO figure out config, maybe through `src/gro.config.ts`

## Creating migrations

Felt server uses [Ley](https://github.com/lukeed/ley) to manage its DB migrations.
Migration files are located in the [migrations](./migrations) directory.
To create a new migration file use the `ley new` command (see Ley's docs for more details)
Use `gro lib/db/migrate` to run migrations.

## Creating backups

Using the following command one can quickly take backups of the `felt` database.

```
sudo -u postgres pg_dump felt > backup.sql
```

## Database tasks

Felt has a number of [Gro](https://github.com/feltjs/gro) tasks for managing the database.
To view all of them, run `gro lib/db`.

### lib/db/create

The task `gro lib/db/create` creates the database from scratch.
It destroys any existing schema and data, runs all migrations (TODO), and seeds the database.

```bash
gro lib/db/create
gro lib/db/create --no-seed # creates the database with no initial data
```

The tasks it composes can be run individually:

- `gro lib/db/destroy`
- `gro lib/db/migrate`
- `gro lib/db/seed`
