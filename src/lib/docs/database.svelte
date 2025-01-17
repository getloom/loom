<script lang="ts">
	import CodeExample from '$lib/ui/CodeExample.svelte';
</script>

<div class="prose">
	<h2>Database</h2>

	<h3>Dependencies</h3>

	<ul>
		<li><a href="https://www.postgresql.org">PostgreSQL</a></li>
		<li><a href="https://github.com/porsager/postgres"><code>postgres</code></a> Node driver</li>
		<li><a href="https://github.com/lukeed/ley"><code>ley</code></a> for migrations</li>
	</ul>

	<h3>Postgres setup</h3>

	<p>
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

	<CodeExample
		code={`database = PGDATABASE or 'loom'
username = PGUSERNAME or PGUSER or 'postgres'
password = PGPASSWORD or 'password'
host = PGHOST or 'localhost'
port = PGPORT or 5432
idle_timeout = PGIDLE_TIMEOUT
connect_timeout = PGCONNECT_TIMEOUT`}
	/>

	<p>To set up the database with the expected defaults:</p>

	<CodeExample
		code={`sudo -u postgres psql
# in psql:
# postgres=#
create database loom; # notice the semicolon
\\password
# enter "password"`}
	/>

	<blockquote>TODO figure out config, maybe through <code>src/gro.config.ts</code></blockquote>
	<h3>Creating migrations</h3>
	<p>
		Loom server uses <a href="https://github.com/lukeed/ley">Ley</a> to manage its DB migrations.
		Migration files are located in the
		<a href="https://github.com/getloom/loom/tree/main/src/lib/db/migrations">migrations</a>
		directory. To create a new migration file use the <code>ley new</code> command (see Ley's docs
		for more details) Use <code>gro db/migrate</code> to run migrations.
	</p>
	<h3>Creating backups</h3>
	<p>Using the following command one can quickly take backups of the <code>Loom</code> database.</p>

	<CodeExample code={`sudo -u postgres pg_dump loom > backup.sql`} />

	<h3>Database tasks</h3>

	<p>
		Loom has a number of <a href="https://github.com/grogarden/gro">Gro</a> tasks for managing the
		database. To view all of them, run <code>gro db</code>.
	</p>

	<h4>lib/db/create</h4>

	<p>
		The task <code>gro db/create</code> creates the database from scratch. It destroys any existing schema
		and data, runs all migrations (TODO), and seeds the database.
	</p>
	<CodeExample
		code={`gro db/create
gro db/create --no-seed # creates the database with no initial data`}
	/>

	<p>The tasks it composes can be run individually:</p>

	<ul>
		<li><code>gro db/destroy</code></li>
		<li><code>gro db/migrate</code></li>
		<li><code>gro db/seed</code></li>
	</ul>
</div>
