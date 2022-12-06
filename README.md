[<img src="src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

# `@feltcoop/felt-server`

> server for [Felt](https://github.com/feltcoop/felt),
> a tool for building and maintaining communities 💚

> **work in progress**: pre-alpha

[`@feltcoop/felt-server`](https://www.npmjs.com/package/@feltcoop/felt-server)
is a [Node.js](https://nodejs.org/) server that you can use in many different ways:

- as an <strong>end user</strong> on an instance deployed to the web,
  communicating with people and managing information
- as an <strong>operator user</strong> deploying an instance to the web via servers IRL,
  doing admin and maintenance
- as a <strong>dev user</strong> making a custom server using
  [the library on npm](https://www.npmjs.com/package/@feltcoop/felt-server)
  via `npm i -D @feltcoop/felt-server`
- as a <strong>dev user</strong> downloading or forking this repo with git,
  adding or changing anything you wish

## getting started developing

For more, see [Getting started](/src/docs/getting-started.md) and
[Contributing](/contributing.md)

For build & deployment docs, see the [Infra README](/src/lib/infra/README.md)

## using `@feltcoop/felt-server` as a library

[`@feltcoop/felt-server`](https://www.npmjs.com/package/@feltcoop/felt-server)
can be installed as a library on npm to make custom servers:

```bash
npm i -D @feltcoop/felt-server # see the available modules at `/src/gro.config.ts`
```

Learn more about [using `@feltcoop/felt-server` as a library](/src/docs/library-usage.md).

## using `@feltcoop/felt-server` as a git repo

To work directly on the codebase,
first set up [a local dev environment](/src/docs/getting-started.md), then:

```bash
# node >=18.6
npm i

# start SvelteKit/Vite and the Node server
npm run dev

# browse to localhost:5173 or whatever it says

# you can also run `gro dev` with Gro installed globally: npm i -g @feltcoop/gro
gro dev # args are forwarded to `svelte-kit` like `npm run dev`
gro # print available tasks

npm test
# or
gro test
```

> learn more [about Gro](https://github.com/feltcoop/gro),
> [getting started with `@feltcoop/felt-server`](/src/docs/getting-started.md),
> and [contributing](/contributing.md)

## credits 🐢<sub>🐢</sub><sub><sub>🐢</sub></sub>

Design contributions by [Jane Im](https://imjane.net/) ([@trusttri](https://github.com/trusttri))

Open source software including
[Polka](https://github.com/lukeed/polka) ∙
[Svelte](https://github.com/sveltejs/svelte) ∙
[SvelteKit](https://github.com/sveltejs/kit) ∙
[Vite](https://github.com/vitejs/vite) ∙
[TypeScript](https://github.com/microsoft/TypeScript) ∙
[MDsveX](https://github.com/pngwn/MDsveX) ∙
[uvu](https://github.com/lukeed/uvu) ∙
[Postgres.js](https://github.com/porsager/postgres) ∙
[Ley](https://github.com/lukeed/ley) ∙
[tsm](https://github.com/lukeed/tsm) ∙
[Gro](https://github.com/feltcoop/gro) ∙
[Felt](https://github.com/feltcoop/felt) ∙
[ESLint](https://github.com/eslint/eslint) ∙
[Prettier](https://github.com/prettier/prettier)
& [more](package.json)

## license [🐦](https://en.wikipedia.org/wiki/Free_and_open-source_software)

[MIT](LICENSE)
