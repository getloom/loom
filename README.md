[<img src="src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

# `@feltjs/felt-server`

> server for [Felt](https://github.com/feltjs/felt),
> a programmable platform for hobbyists and human-scale communities 💚

> **work in progress**: pre-alpha

[`@feltjs/felt-server`](https://www.npmjs.com/package/@feltjs/felt-server)
is a [Node.js](https://nodejs.org/) server that you can use in many different ways:

- as an <strong>end user</strong> on an instance deployed to the web,
  communicating with people and managing information
- as an <strong>operator user</strong> deploying an instance to the web via servers IRL,
  doing admin and infra
- as a <strong>dev user</strong> making a custom server using
  [the library on npm](https://www.npmjs.com/package/@feltjs/felt-server)
  via `npm i -D @feltjs/felt-server`
- as a <strong>dev user</strong> downloading or forking this repo with git,
  adding or changing anything you wish

## getting started

To learn about the project, see [felt.dev/about](https://felt.dev/about).

To play with the code, seee [Getting started](/src/docs/getting-started.md) and
[Contributing](/contributing.md).

To deploy [`@feltjs/felt-server`](https://github.com/feltjs/felt-server) to production,
see [`src/docs/deploying-production.md`](/src/docs/deploying-production.md).

To manage a production instance,
see [`src/docs/managing-production.md`](/src/docs/managing-production.md).

## using `@feltjs/felt-server` as a library

[`@feltjs/felt-server`](https://www.npmjs.com/package/@feltjs/felt-server)
can be installed as a library on npm to make custom servers:

```bash
npm i -D @feltjs/felt-server # see the available modules at `/src/gro.config.ts`
```

Learn more about [using `@feltjs/felt-server` as a library](/src/docs/library-usage.md).

## using `@feltjs/felt-server` as a git repo

To work directly on the codebase,
see [Getting started](/src/docs/getting-started.md), then:

```bash
# node >=18.14
npm i

# start SvelteKit/Vite and the Node server
npm run dev

# browse to localhost:5173 or whatever it says

# you can also run `gro dev` with Gro installed globally: npm i -g @feltjs/gro
gro dev # args are forwarded to `svelte-kit` like `npm run dev`
gro # print available tasks

npm test
# or
gro test
```

> learn more [about Gro](https://github.com/feltjs/gro),
> [getting started with `@feltjs/felt-server`](/src/docs/getting-started.md),
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
[Gro](https://github.com/feltjs/gro) ∙
[felt-ui](https://github.com/feltjs/felt-ui) ∙
[ESLint](https://github.com/eslint/eslint) ∙
[Prettier](https://github.com/prettier/prettier)
& [more](package.json)

## license [🐦](https://en.wikipedia.org/wiki/Free_and_open-source_software)

[MIT](LICENSE)
