[<img src="static/loom.png" align="right" width="192" height="178">](https://getloom.org)

# `@getloom/loom`

> a programmable platform for hobbyists and human-scale communities 🧺
> [@getloom](https://github.com/getloom)

> **work in progress**: pre-alpha

Loom is a [Node.js](https://nodejs.org/) server that you can use in many different ways:

- as an <strong>end user</strong> using Loom like Slack or Discord,
  but with more power to build custom experiences
- as an <strong>operator user</strong> deploying an instance to the web via servers IRL,
  doing admin and infra
- (coming soon) as a <strong>dev user</strong> making a custom server using
  [the library on npm](https://www.npmjs.com/package/@getloom/loom)
- as a <strong>dev user</strong> downloading or forking this repo with git,
  adding or changing anything you wish

## design colors

Loom uses the following hex codes as it's base branding:
Purple: #7019A4 RGB: 112–25–164
Peach: #F6A719 RGB: 246–167–25
Green: #13BE28 RGB: 19–190–40

https://paletton.com/#uid=34G0V0ksJuNhRD-mXwrvdoT-mjF

## getting started

To learn about the project, see [getloom.org/about](https://getloom.org/about).
We'll link to a video introduction with the alpha announcement.

To play with the code, see
[Getting started](https://www.getloom.org/docs/guide/admin/getting-started) and
[Contributing](CONTRIBUTING.md).
Docs are a work-in-progress at
[getloom.org/docs](https://www.getloom.org/docs),
including our
[known issues](https://www.getloom.org/docs/guide/user/known-issues).

To deploy to production, see
[Deploying production](https://www.getloom.org/docs/guide/admin/deploying-production)
and [Managing production](https://www.getloom.org/docs/guide/admin/managing-production).

The server has integrated reference docs, which we'll link after the alpha announcement.
We also publish [our vocabulary as a JSON Schema](/src/schemas/vocab.json).

## using `@getloom/loom` as a library

> support for this coming soon - it's published to npm but not yet usable

[`@getloom/loom`](https://www.npmjs.com/package/@getloom/loom)
can be installed as a library on npm to make custom servers:

```bash
npm i -D @getloom/loom # see the available modules at `/src/gro.config.ts`
```

Learn more about
[using `@getloom/loom` as a library](https://www.getloom.org/docs/guide/dev/library-usage).

## local development

To work directly on the codebase,
see [Getting started](https://www.getloom.org/docs/guide/admin/getting-started), then:

```bash
# node >=20.10
npm i

# start SvelteKit/Vite and the Node server
npx gro dev # args are forwarded to `vite dev`
gro dev # install Gro globally: npm i -g @ryanatkn/gro

# browse to localhost:5173 or whatever it says

gro # print available tasks
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
