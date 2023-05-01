[<img src="/src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

# Getting started with `@feltjs/felt-server`

> docs for devs and operators of
> [`@feltjs/felt-server`](https://github.com/feltjs/felt-server),
> a tool for building and maintaining communities 💚

Looking for instructions for how to use this project as a library?
See [library-usage](./library-usage.md).

## Overview

`@feltjs/felt-server` depends on the following core technologies:

- [Node](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org) using
  the [`postgres`](https://www.npmjs.com/package/postgres) driver
- [Svelte](https://svelte.dev) and [SvelteKit](https://kit.svelte.dev)
- [TypeScript](https://www.typescriptlang.org)

## felt-server overview diagram

```mermaid
%%{ init: { 'flowchart': { 'curve': 'monotoneY' } } }%%
flowchart
	subgraph db
		P[(postgres)]
		click P "https://github.com/feltjs/felt-server/blob/main/src/docs/data-model.md"
	end
	subgraph Node backend
		S[Services] -- function calls --> R[Repos]
		R -- queries -->
		P -- data --> R
		R -- data --> S
	end
	subgraph browser frontend
		A[Actions] -- "API requests
		(websockets and RESTful http)" --> S
		S -- "API response and broadcast data" --> A
		C["Views (Svelte components)"] <-- ui --> A
	end
```

## Setup

Set up [a local dev environment](/src/docs/setup-dev-environment.md).

## Developing

In most cases [`gro dev`](https://github.com/feltjs/gro/blob/main/src/docs/dev.md)
is the only command you'll need to run during development.
It starts both SvelteKit and an API server,
and when files change the system should automatically update or restart as needed.
See [Gro's docs](https://github.com/feltjs/gro) for more.

## Manual dev processes

There's two manual steps that you may sometimes need to perform:

### `gro format`

Gro integrates formatting with [Prettier](https://github.com/prettier/prettier).
[This project's CI](/.github/workflows/check.yml)
runs `gro check` which runs `gro format --check` which fails if any files are unformatted.
You can manually format the project with `gro format`, and if you're using VSCode,
[the Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
combined with the setting `"editor.formatOnSave": true`
should take care of formatting automatically.

### `gro gen`

Gro provides the [`gro gen`](https://github.com/feltjs/gro/blob/main/src/docs/gen.md)
task to make it easier to derive data and other files from single sources of truth.
It currently has a limitation where it does not run automatically;
the developer is expected to run `gro gen` when things change.
Making this process automatic is next on
[`gro gen`'s TODO list](https://github.com/feltjs/gro/blob/main/src/docs/gen.md#todo),
but it's a tricky system to design without surprising performance implications.

[This project's CI](/.github/workflows/check.yml)
runs `gro check` which runs `gro gen --check` which fails if any generated files have changed,
to help ensure that the committed files remain in sync.

> The files that `gro gen` outputs are formatted automatically when possible,
> so there's no need to get things perfect.

## Building

The [`gro build`](https://github.com/feltjs/gro/blob/main/src/docs/build.md) command
outputs artifacts to the gitignored `/dist` directory,
which can then deployed to production and published to a package registry like npm.
For SvelteKit projects, `gro build` wraps `svelte-kit build`,
and it also produces directories for each of
[Gro's configured production builds](https://github.com/feltjs/gro/blob/main/src/docs/config.md).
See [Gro's build docs](https://github.com/feltjs/gro/blob/main/src/docs/build.md) for more.

## Deploying

To deploy a self-hosted instance to production,
see the instructions at
[`src/docs/deploying-production.md`](/src/docs/deploying-production.md).

To manage a production instance,
see [`src/docs/managing-production.md`](/src/docs/managing-production.md).
