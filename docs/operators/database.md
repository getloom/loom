# Database

## Dependencies

* <a href="https://www.postgresql.org">PostgreSQL</a></li>
* <a href="https://github.com/porsager/postgres"><code>postgres</code></a> Node driver</li>
* <a href="https://github.com/lukeed/ley"><code>ley</code></a> for migrations

## Postgres setup

The Loom server has a dependency on <a href="https://www.postgresql.org">PostgreSQL</a> 15+. You
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

Loom server uses <a href="https://github.com/lukeed/ley">Ley</a> to manage its DB migrations.
		Migration files are located in the
		<a href="https://github.com/getloom/loom/tree/main/src/lib/db/migrations">migrations</a>
		directory. To create a new migration file use the <code>ley new</code> command (see Ley's docs
		for more details) Use <code>gro db/migrate</code> to run migrations.

## Creating backups</h3>
Using the following command one can quickly take backups of the <code>Loom</code> database.</p>

```sudo -u postgres pg_dump loom > backup.sql```

## Database tasks</h3>

Loom has a number of <a href="https://github.com/grogarden/gro">Gro</a> tasks for managing the
		database. To view all of them, run <code>gro db</code>.

### lib/db/create

The task <code>gro db/create</code> creates the database from scratch. It destroys any existing schema
		and data, runs all migrations (TODO), and seeds the database.
```
gro db/create
gro db/create --no-seed # creates the database with no initial data
```

The tasks it composes can be run individually:

* <code>gro db/destroy</code>
* <code>gro db/migrate</code>
* <code>gro db/seed</code>