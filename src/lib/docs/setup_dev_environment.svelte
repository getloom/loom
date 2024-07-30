<script lang="ts">
	import {base} from '$app/paths';

	import CodeExample from '$lib/ui/CodeExample.svelte';
	import {getDocsSettings} from '$lib/docs/docs.js';

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);
</script>

<div class="prose">
	<h2>Development setup</h2>
	<p>This walks through setting up a development environment for loom.coop projects.</p>
	<h3>1. Git</h3>
	<p>
		<code>@getloom/loom</code>'s code is on GitHub:
		<a href="https://github.com/getloom/loom">github.com/getloom/loom</a>
	</p>
	<p>Configure git:</p>
	<CodeExample
		code={`git config --global user.name "YOUR NAME"
git config --global user.email YOUR@EMAIL.com
# workflow options
git config --global pull.rebase true # avoids tangling with merge commits on pull
git config --global push.default simple # avoids polluting remote with local branches
# some other nice options
git config --global color.ui auto
git config --global core.pager 'less -x1,5'`}
	/>

	<h3>2. NodeJS</h3>
	<p>
		<code>@getloom/loom</code> requires <a href="https://nodejs.org/">NodeJS</a> >=20.10. Our
		recommended Node version manager is
		<a href="https://github.com/Schniz/fnm"><code>fnm</code></a>, which is roughly equivalent to
		<a href="https://github.com/nvm-sh/nvm"><code>nvm</code></a> with improved performance.
	</p>
	<p>
		See the <a href="https://github.com/Schniz/fnm/"><code>fnm</code> installation instructions</a>,
		then:
	</p>
	<CodeExample
		code={`fnm install 20
# run these lines if you already had fnm:
fnm use 20
fnm default 20`}
	/>
	<p>
		Now that we have git and Node installed, clone the <code>@getloom/loom</code> repo and install
		with <code>npm</code>:
	</p>
	<CodeExample
		code={`git clone https://github.com/getloom/loom
cd loom
npm i # install dependencies`}
	/>
	<p>
		Install any desired global dependencies. Loom uses <a href="https://github.com/grogarden/gro"
			>Gro</a
		>
		for tasks and <a href="https://github.com/changesets/changesets">Changesets</a> (installed globally)
		for versioning and changelogs:
	</p>
	<CodeExample code={`npm i -g @ryanatkn/gro @changesets/cli`} />
	<p>To upgrade an existing installation:</p>
	<CodeExample
		code={`fnm install 20
fnm use 20
fnm default 20
fnm ls # view the status of your installed versions
fnm uninstall X # remove any old versions you no longer want
npm i -g @ryanatkn/gro @changesets/cli # reinstall global dependencies`}
	/>
	<h3>3. Postgres</h3>
	<p>
		<code>@getloom/loom</code> requires <a href="https://www.postgresql.org/">Postgres</a> >= 15.
		For details about Loom's database implementation, see
		<a href="{base}{path}/guide/dev/data-model">the data model docs</a>.
	</p>
	<p>
		<code>@getloom/loom</code> defaults to user <code>postgres</code> with password
		<code>password</code>
		and database
		<code>loom</code>. To set up its database with the expected defaults:
	</p>
	<CodeExample
		code={`sudo -u postgres psql
# in psql:
# postgres=#
create database loom; # notice the semicolon
\\password
# enter "password" or env.PGPASSWORD`}
	/>
	<p>
		Now that the database is setup and the repo is installed, run the project locally on your
		machine. First initialize the database and run the tests to ensure everything works:
	</p>
	<CodeExample
		code={`gro db/create
gro test
gro dev # browse to localhost:5173
gro # print available tasks`}
	/>
	<h3>4. VSCode</h3>
	<p>
		We use <a href="https://code.visualstudio.com/">VSCode</a> for its Svelte and extension support.
	</p>
	<p>Our recommended extensions:</p>
	<ul>
		<li>
			<a href="https://github.com/sveltejs/language-tools">Svelte for VS Code</a> -
			<a href="https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode"
				><code>svelte.svelte-vscode</code></a
			>
		</li>
		<li>
			<a href="https://github.com/prettier/prettier-vscode">Prettier code formatter</a> -
			<a href="https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode"
				><code>esbenp.prettier-vscode</code></a
			>
		</li>
		<li>
			<a href="https://github.com/microsoft/vscode-eslint">ESLint</a> -
			<a href="https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint"
				><code>dbaeumer.vscode-eslint</code></a
			>
			<ul>
				<li>
					to enable Svelte for the VSCode ESLint plugin, add the following line to <code
						>settings.json</code
					>:
					<code>"eslint.validate": ["javascript", "svelte"],</code>
				</li>
				<li>
					for more, see <a href="https://github.com/getloom/eslint-config"
						><code>@getloom/eslint-config</code></a
					>
				</li>
			</ul>
		</li>
	</ul>
	<p>
		Loom chooses Bash integration over Windows support. We recommend <a
			href="https://docs.microsoft.com/en-us/windows/wsl/wsl2-install">WSL</a
		> with Ubuntu for Windows users.
	</p>
</div>
