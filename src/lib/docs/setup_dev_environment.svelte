<script lang="ts">
	import {base} from '$app/paths';

	import CodeExample from '$lib/ui/CodeExample.svelte';
	import {getDocsSettings} from '$lib/docs/docs';

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);
</script>

<div class="prose">
	<h2>Development setup</h2>
	<p>This walks through setting up a development environment for Felt.coop projects.</p>
	<h3>1. Git</h3>
	<p>
		<code>@feltjs/felt</code>'s code is on GitHub:
		<a href="https://github.com/feltjs/felt">github.com/feltjs/felt</a>
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
		<code>@feltjs/felt</code> requires <a href="https://nodejs.org/">NodeJS</a> >=20.5. Our
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
		Now that we have git and Node installed, clone the <code>@feltjs/felt</code> repo and install
		with <code>npm</code>:
	</p>
	<CodeExample
		code={`git clone https://github.com/feltjs/felt
cd felt
npm i # install dependencies`}
	/>
	<p>Install any desired global dependencies:</p>
	<CodeExample code={`npm i -g @feltjs/gro @changesets/cli`} />
	<p>To upgrade an existing installation:</p>
	<CodeExample
		code={`fnm install 20
fnm use 20
fnm default 20
fnm ls # view the status of your installed versions
fnm uninstall X # remove any old versions you no longer want
npm i -g @feltjs/gro @changesets/cli # reinstall global dependencies`}
	/>
	<h3>3. Postgres</h3>
	<p>
		<code>@feltjs/felt</code> requires <a href="https://www.postgresql.org/">Postgres</a> >= 15. For
		details about felt's database implementation, see
		<a href="{base}{path}/guide/dev/data-model">the data model docs</a>.
	</p>
	<p>
		<code>@feltjs/felt</code> defaults to user <code>postgres</code> with password
		<code>password</code>
		and database
		<code>felt</code>. To set up its database with the expected defaults:
	</p>
	<CodeExample
		code={`sudo -u postgres psql
# in psql:
# postgres=#
create database felt; # notice the semicolon
\\password
# enter "password" or env.PGPASSWORD`}
	/>
	<p>
		Now that the database is setup and the repo is installed, run the project locally on your
		machine:
	</p>
	<CodeExample
		code={`npm run dev
npm test
# or
gro dev
gro test
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
					for more, see <a href="https://github.com/feltjs/eslint-config"
						><code>@feltjs/eslint-config</code></a
					>
				</li>
			</ul>
		</li>
	</ul>
	<p>
		Felt's projects are not currently being tested on Windows.
		<a href="https://docs.microsoft.com/en-us/windows/wsl/wsl2-install">WSL2</a> provides a decent
		experience running a Linux distro on Windows via the VSCode extension
		<a href="https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl"
			>Remote - WSL</a
		>. (may not work with VSCodium, and may have various issues)
	</p>
</div>
