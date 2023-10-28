[<img src="src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

# `@feltjs/felt`

> a programmable platform for hobbyists and human-scale communities 💚
> [@feltjs](https://github.com/feltjs)

> **work in progress**: pre-alpha

Felt is a [Node.js](https://nodejs.org/) server that you can use in many different ways:

- as an <strong>end user</strong> using Felt like Slack or Discord,
  but with more power to build custom experiences
- as an <strong>operator user</strong> deploying an instance to the web via servers IRL,
  doing admin and infra
- (coming soon) as a <strong>dev user</strong> making a custom server using
  [the library on npm](https://www.npmjs.com/package/@feltjs/felt)
- as a <strong>dev user</strong> downloading or forking this repo with git,
  adding or changing anything you wish

## getting started

To learn about the project, see [felt.dev/about](https://felt.dev/about).
We'll link to a video introduction with the alpha announcement.

To play with the code, see
[Getting started](https://www.felt.dev/docs/guide/admin/getting-started) and
[Contributing](CONTRIBUTING.md).
Docs are a work-in-progress at
[felt.dev/docs](https://www.felt.dev/docs),
including our
[known issues](https://www.felt.dev/docs/guide/user/known-issues).

To deploy to production, see
[Deploying production](https://www.felt.dev/docs/guide/admin/deploying-production)
and [Managing production](https://www.felt.dev/docs/guide/admin/managing-production).

The server has integrated reference docs, which we'll link after the alpha announcement.
We also publish [our vocabulary as a JSON Schema](/src/schemas/vocab.json).

## using `@feltjs/felt` as a library

> support for this coming soon - it's published to npm but not yet usable

[`@feltjs/felt`](https://www.npmjs.com/package/@feltjs/felt)
can be installed as a library on npm to make custom servers:

```bash
npm i -D @feltjs/felt # see the available modules at `/src/gro.config.ts`
```

Learn more about
[using `@feltjs/felt` as a library](https://www.felt.dev/docs/guide/dev/library-usage).

## using `@feltjs/felt` as a git repo

To work directly on the codebase,
see [Getting started](https://www.felt.dev/docs/guide/admin/getting-started), then:

```bash
# node >=20.7
npm i

# start SvelteKit/Vite and the Node server
npm run dev

# browse to localhost:5173 or whatever it says

# you can also run `gro dev` with Gro installed globally:
npm i -g @grogarden/gro
gro # print available tasks
gro dev # args are forwarded to `vite` like `npm run dev`

npm test
# or
gro test
```

> learn more about [Gro](https://github.com/grogarden/gro),
> [SvelteKit](https://kit.svelte.dev/), and
> [Vite](https://vitejs.dev/)

## credits 🐢<sub>🐢</sub><sub><sub>🐢</sub></sub>

Design contributions by [Jane Im](https://imjane.net/) ([@trusttri](https://github.com/trusttri))

Open source software including
[Polka](https://github.com/lukeed/polka) ∙
[Svelte](https://github.com/sveltejs/svelte) ∙
[SvelteKit](https://github.com/sveltejs/kit) ∙
[Vite](https://github.com/vitejs/vite) ∙
[TypeScript](https://github.com/microsoft/TypeScript) ∙
[SVAST](https://github.com/pngwn/MDsveX) ∙
[Fuz](https://github.com/fuz-dev/fuz) ∙
[Gro](https://github.com/grogarden/gro) ∙
[uvu](https://github.com/lukeed/uvu) ∙
[Postgres.js](https://github.com/porsager/postgres) ∙
[Ley](https://github.com/lukeed/ley) ∙
[ESLint](https://github.com/eslint/eslint) ∙
[Prettier](https://github.com/prettier/prettier)
& [more](package.json)

## license [🐦](https://en.wikipedia.org/wiki/Free_and_open-source_software)

[MIT](LICENSE)
