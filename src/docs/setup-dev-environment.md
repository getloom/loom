# Development setup

This walks through setting up a development environment for Felt.coop projects.

**1. Git**

`@feltjs/felt-server`'s git repo is on GitHub: <https://github.com/feltjs/felt-server.git>

Configure git:

```bash
git config --global user.name "YOUR NAME"
git config --global user.email YOUR@EMAIL.com
# workflow options
git config --global pull.rebase true # avoids tangling with merge commits on pull
git config --global push.default simple # avoids polluting remote with local branches
# some other nice options
git config --global color.ui auto
git config --global core.pager 'less -x1,5'
```

**2. NodeJS**

`@feltjs/felt-server` requires [NodeJS](https://nodejs.org) ^18.14.
Our recommended Node version manager is [`fnm`](https://github.com/Schniz/fnm),
which is roughly equivalent to [`nvm`](https://github.com/nvm-sh/nvm) with improved performance.

See the [`fnm` installation instructions](https://github.com/Schniz/fnm/), then:

```bash
fnm install 18  # installs and sets to default
```

Now that we have git and Node installed,
clone the `@feltjs/felt-server` repo and install with `npm`:

```bash
git clone https://github.com/feltjs/felt-server
cd felt-server
npm i # install dependencies
```

**3. Postgres**

`@feltjs/felt-server` requires [Postgres](https://www.postgresql.org/) >= 15.
For more details see
[the database docs](https://github.com/feltjs/felt-server/tree/main/src/db).

TODO defaults are in code, not the env vars, is a better UX to include them

`@feltjs/felt-server` defaults to user `postgres` with password `password` and database `felt`.
To set up its database with the expected defaults:

```bash
sudo -u postgres psql
# in psql:
# postgres=#
create database felt; # notice the semicolon
\password
<enter "password">
```

Now that the database is setup and the repo is installed,
run the project locally on your machine:

```bash
npm run dev
npm test
# or
gro dev
gro test
gro # print available tasks
```

**4. VSCode**

We use [VSCode](https://code.visualstudio.com/) for its Svelte and extension support.

- recommended extensions
  - [Svelte for VS Code](https://github.com/sveltejs/language-tools) -
    [`svelte.svelte-vscode`](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
  - [Prettier code formatter](https://github.com/prettier/prettier-vscode) -
    [`esbenp.prettier-vscode`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [ESLint](https://github.com/microsoft/vscode-eslint) -
    [`dbaeumer.vscode-eslint`](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
    - to enable Svelte for the VSCode ESLint plugin, add the following line to `settings.json`:
      `"eslint.validate": ["javascript", "svelte"],`
    - for more, see [`@feltjs/eslint-config`](https://github.com/feltjs/eslint-config)
- other nice extensions
  - depending on your OS, [Subword navigation](https://github.com/ow--/vscode-subword-navigation) -
    [`ow.vscode-subword-navigation`](https://marketplace.visualstudio.com/items?itemName=ow.vscode-subword-navigation)

Felt's projects are not currently being tested on Windows.
[WSL2](https://docs.microsoft.com/en-us/windows/wsl/wsl2-install)
provides a decent experience running a Linux distro on Windows
via the VSCode extension
[Remote - WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl).
(may not work with VSCodium, and may have frustrating issues like no systemd)
