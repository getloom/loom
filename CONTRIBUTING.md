[<img src="/src/loom.png" align="right" width="192" height="178">](https://getloom.org)

# Contributing to `@getloom/loom`

Thanks for your interest in helping!
To keep our development speed up,
[@getloom](https://github.com/getloom) makes most decisions in private,
but we are planning to develop open community-driven processes soon.
Our code is open source, so we publish it as we write it,
and [the license](LICENSE) is permissive, so you can do whatever you wish with it.
See also our [GOVERNANCE.md](GOVERNANCE.md)
and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

We plan to publish a public roadmap and discuss increasingly more in public.
For now please feel free to
[open issues](https://github.com/getloom/loom/issues) on GitHub,
join the development community at [getloom.org](https://getloom.org)
and for private feedback email [hamilton@getloom.org](mailto:hamilton@getloom.org).

[Pull requests](https://github.com/getloom/loom/pulls)
are welcome for straightforward fixes and improvements,
but when there's non-obvious design choices or other ambiguities,
please open an [issue](https://github.com/getloom/loom/issues)
to work out the details with the maintainers.

Loom is currently governed by a
[Temporary Benevolent Dictator (TBD)](GOVERNANCE.md)

## Development setup
This section walks through setting up a development environment for the loom project.

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
`@getloom/loom` requires <a href="https://nodejs.org/">NodeJS</a> >=20.10. Our recommended Node version manager is <a href="https://github.com/nvm-sh/nvm"><code>nvm</code></a> 
	
### 3. Postgres
`@getloom/loom` requires <a href="https://www.postgresql.org/">Postgres</a> >= 15.
		For details about Loom's database implementation, see
		<a href="{base}{path}/guide/dev/data-model">the data model docs</a>.
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

Now that the database is setup and the repo is installed, run the project locally on your machine. First initialize the database and run the tests to ensure everything works:

```gro db/create
gro test
gro dev # browse to localhost:5173
gro # print available tasks
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
	
Loom chooses Bash integration over Windows support. We recommend <a href="https://docs.microsoft.com/en-us/windows/wsl/wsl2-install">WSL</a
		> with Ubuntu for Windows users.

