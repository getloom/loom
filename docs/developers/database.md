# Database

## Dependencies

* <a href="https://www.postgresql.org">PostgreSQL</a></li>
* <a href="https://github.com/porsager/postgres"><code>postgres</code></a> Node driver</li>
* <a href="https://github.com/lukeed/ley"><code>ley</code></a> for migrations

## Postgres setup

Loom is powered by <a href="https://www.postgresql.org">PostgreSQL</a> 15+. You
		can find
		<a href="https://www.postgresql.org/download/">setup instructions</a> on their website.
	</p>
	<p>
		Loom's database driver is <a href="https://github.com/porsager/postgres"
			><code>postgres</code></a
		>. See <a href="https://github.com/porsager/postgres#readme">its README</a> to learn more.
	</p>
	<p>
		At the moment, the server defaults to connecting to the database with the following values,
		prioritizing
		<a href="https://vitejs.dev/guide/env-and-mode.html#env-variables">environment variables</a> if they're
		defined:
	</p>

```
database = PGDATABASE or 'loom'
username = PGUSERNAME or PGUSER or 'postgres'
password = PGPASSWORD or 'password'
host = PGHOST or 'localhost'
port = PGPORT or 5432
idle_timeout = PGIDLE_TIMEOUT
connect_timeout = PGCONNECT_TIMEOUT`
```

To set up the database with the expected defaults:</p>

```sudo -u postgres psql
# in psql:
# postgres=#
create database loom; # notice the semicolon
\\password
# enter "password"
```

## Creating migrations

Loom server uses <a href="https://github.com/lukeed/ley">Ley</a> to manage its DB migrations. Migration files are located in the
<a href="https://github.com/getloom/loom/tree/main/src/lib/db/migrations">migrations</a> directory. 

To create a new migration file use the `ley new` command (see Ley's docs for more details) Use `npm run db:migrate` to run migrations.

## Creating backups</h3>

The following command makes a backup dump of the default <code>loom</code> table</p>

`sudo -i -u postgres pg_dump loom > backup.sql`

And these commands can restore that dump to the default loom table. Note: you may have to drop and recreate the <code>loom</code> table first
	</p>
`sudo -i -u postgres psql -d loom {'<'} backup.sql`

## Database tasks</h3>

Loom has a number of npm tasks for managing the database.

### npm run db:create

The task <code>npm run db:create</code> creates the database from scratch. It destroys any existing schema
		and data, runs all migrations, and seeds the database.
```
npm run db:create
```

The tasks it composes can be run individually:

* <code>npm run db:destroy</code>
* <code>npm run db:migrate</code>
* <code>npm run db:seed</code>