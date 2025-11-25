## Development setup
This section walks through setting up a development environment for the loom project.

> 🚨 A Quick Note About  Gro:
>
>You may notice some commands in this doc refer to a tool called `gro`. This tool was included in our tech stack early in development to fill a perceived gap in the Svelte/Typescript ecosystem. 
>
>Base tooling in the form of `npm` has since caught up & so it is the long term goal of this project to remove the `gro` dependency. See [issue #9](https://github.com/getloom/loom/issues/9)

### 1. Git
Configure git:
```
git config --global user.name "YOUR NAME"
git config --global user.email YOUR@EMAIL.com

# workflow options
git config --global pull.rebase true # avoids tangling with merge commits on pull
git config --global push.default simple # avoids polluting remote with local branches

# some other nice options
git config --global color.ui auto
git config --global core.pager 'less -x1,5'
```

### 2. NodeJS
`@getloom/loom` requires [NodeJS](https://nodejs.org/) >=20.10. Our recommended Node version manager is [nvm](https://github.com/nvm-sh/nvm). 
	
### 3. Postgres
`@getloom/loom` requires <a href="https://www.postgresql.org/">Postgres</a> >= 15.
		For details about Loom's database implementation, see
		[the data model docs](../users/data_model.md).
	</p>
	<p>
		<code>@getloom/loom</code> defaults to user <code>postgres</code> with password
		<code>password</code>
		and database
		<code>loom</code>. To set up its database with the expected defaults:
	</p>
```
sudo -u postgres psql
# in psql:
# postgres=#
create database loom; # notice the semicolon
\\password
# enter "password" or env.PGPASSWORD
```

Now that the database is setup and the repo is installed, run the project locally on your machine. Run the following commands first to initialize the database and run the tests to ensure everything works:

```npm run db:create
npx gro test
npx gro dev # browse to localhost:5173
npx gro # print available tasks
```

### 4. VSCode
We use <a href="https://code.visualstudio.com/">VSCode</a> for its Svelte and extension support.


Our recommended extensions:
* <a href="https://github.com/sveltejs/language-tools">Svelte for VS Code</a> - <a href="https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode"><code>svelte.svelte-vscode</code></a>
* <a href="https://github.com/prettier/prettier-vscode">Prettier code formatter</a> - <a href="https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode"><code>esbenp.prettier-vscode</code></a>
* <a href="https://github.com/microsoft/vscode-eslint">ESLint</a> - <a href="https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint"><code>dbaeumer.vscode-eslint</code></a>
	* to enable Svelte for the VSCode ESLint plugin, add the following line to <code>settings.json</code
					>:
					<code>"eslint.validate": ["javascript", "svelte"],</code>
	* for more, see <a href="https://github.com/getloom/eslint-config"><code>@getloom/eslint-config</code></a>

## Dev Process
`npx gro dev` is the bread and butter of Loom's dev process. It starts both SvelteKit and an API server, and when files change the system should automatically update or restart as needed. See <a href="https://github.com/grogarden/gro">Gro's docs</a> for more.

There's two manual steps that you may sometimes need to additionally perform:

### <code>npx gro format</code></h4>
Gro integrates formatting with <a href="https://github.com/prettier/prettier">Prettier</a>.
		<a href="https://github.com/getloom/loom/blob/main/.github/workflows/check.yml"
			>This project's CI</a
		>
		runs <code>gro check</code> which runs <code>gro format --check</code> which fails if any files
		are unformatted. You can manually format the project with <code>gro format</code>, and if you're
		using VSCode,
		<a href="https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode"
			>the Prettier extension</a
		>
		combined with the setting <code>"editor.formatOnSave": true</code> should take care of formatting
		automatically.

### <code>npx gro gen</code></h4>


> 🚨 Loom's dependence on this command is currently a liability for long term maintence, and we are looking to remove the last bit of functional dependence on it. 


Gro provides the <a href="https://github.com/grogarden/gro/blob/main/src/lib/docs/gen.md"
			><code>gro gen</code></a
		>
		task to make it easier to derive data and other files from single sources of truth. It currently
		has a limitation where it does not run automatically - the developer is expected to run
		<code>gro gen</code> when things change.
	</p>
	<p>
		<a href="https://github.com/getloom/loom/blob/main/.github/workflows/check.yml"
			>This project's CI</a
		>
		runs <code>gro check</code> which runs
		<code>gro gen --check</code>
		which fails if any generated files have changed, to help ensure that the committed files remain in
		sync.
	</p>
	<blockquote>
		The files that <code>gro gen</code> outputs are formatted automatically when possible, so there's
		no need to get things perfect.
	</blockquote>

## Building
The <a href="https://github.com/grogarden/gro/blob/main/src/lib/docs/build.md"
			><code>npx gro build</code></a
		>
		command outputs artifacts to the gitignored <code>/dist</code> directory, which can then
		deployed to production and published to a package registry like npm. For SvelteKit projects,
		<code>gro build</code>
		wraps
		<code>svelte-kit build</code>, and it also produces directories for each of
		<a href="https://github.com/grogarden/gro/blob/main/src/lib/docs/config.md"
			>Gro's configured production builds</a
		>. See
		<a href="https://github.com/grogarden/gro/blob/main/src/lib/docs/build.md">Gro's build docs</a> for
		more.
	</p>

## Test production locally

To test the production build locally, first update the environment variables in <code
			>.env.production</code
		> to your local machine's values:	

```
PUBLIC_DEPLOY_SERVER_HOST=localhost
PUBLIC_SERVER_PORT=3000
# notice this is ws://, not wss://, and the same port as above
PUBLIC_WEBSOCKET_URL=ws://localhost:3000/ws
PGDATABASE=loom
PGUSER=postgres
PGPASSWORD=password
```

> The production build listens on http, not https, because we deploy to servers with Nginx in
		front of the Node server. This makes it easy to test production locally without dealing with
		certificates.

Then build and run the server:
```
gro build
node dist_server/server/server.js
```
Then browse to <code>${PUBLIC_DEPLOY_SERVER_HOST}:${PUBLIC_SERVER_PORT}</code>, like
		<code>localhost:3000</code> with the above settings. The server also logs where it's listening to
		the console.