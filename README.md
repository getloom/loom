[<img src="src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

# felt-server

> server for [Felt](https://github.com/feltcoop/felt),
> a tool for building and maintaining communities 💚

> **work in progress**: pre-alpha

For more in depth development docs, please see
[Getting started](/src/docs/getting-started.md) and
[Contributing](/contributing.md)

For build & deployment docs, see the [Infra README](/src/lib/infra/README.md)

## getting started

First set up [a local dev environment](/src/docs/getting-started.md), then:

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

# felt-server can be installed as a library for your custom servers:
npm i -D @feltcoop/felt-server # see the available modules at `/src/gro.config.ts`
# TODO add docs for how to use it as a library
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
