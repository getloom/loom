# @feltjs/felt

## 0.12.2

### Patch Changes

- 7da37ea1: upgrade types

## 0.12.1

### Patch Changes

- 60ed66a5: upgrade deps

## 0.12.0

### Minor Changes

- b8a4cdbe: upgrade deps

## 0.11.2

### Patch Changes

- dc1f1d3f: add icon 💚

## 0.11.1

### Patch Changes

- 6d76fdba: export all modules

## 0.11.0

### Minor Changes

- c49309b3: upgrade deps

## 0.10.0

### Minor Changes

- a50aac54: upgrade deps

## 0.9.5

### Patch Changes

- f68d9c00: add package summary to intro docs

## 0.9.4

### Patch Changes

- 3f7f3a15: update docs

## 0.9.3

### Patch Changes

- 75f5304a: upgrade deps which adds `modules` to `package.json`

## 0.9.2

### Patch Changes

- 4b8cc9bf: switch to `@feltjs/felt_mural`

## 0.9.1

### Patch Changes

- a4711458: add peer dep `@sveltejs/kit`
- a4711458: add and export `$lib/package.ts`

## 0.9.0

### Minor Changes

- 67f9143b: upgrade deps

## 0.8.5

### Patch Changes

- a932fbb8: export modules for docs

## 0.8.4

### Patch Changes

- 14c7c593: export ui/style.css

## 0.8.3

### Patch Changes

- c05abb95: fix import paths

## 0.8.2

### Patch Changes

- 3c9cbce6: add gro library plugin to fix published dist

## 0.8.1

### Patch Changes

- 43e788af: include dist in published package

## 0.8.0

### Minor Changes

- 1fc3b615: upgrade `@grogarden/util@0.15` from `0.13`
- 1fc3b615: rename `@fuz.dev/svelte_intersect` from `@fuz.dev/svelte-intersect`

## 0.7.0

- **break**: switch from `@fuz.dev/intersect` to `@fuz.dev/svelte-intersect`
  ([commit](https://github.com/feltjs/felt/commit/3a1ce786ed08f0a0c182a41d04b41c9848c0e7d3))

## 0.6.0

- **break**: switch from `@feltjs/felt-ui` to `@fuz.dev/fuz` and
  `@feltjs/util` to `@grogarden/util`
  ([#942](https://github.com/feltjs/felt/pull/942))

## 0.5.0

- **break**: rename package to `felt` from `felt-server`
  ([#941](https://github.com/feltjs/felt/pull/941))

## 0.4.6

- remove `Vocab` contextmenu temporarily
  ([#909](https://github.com/feltjs/felt/pull/909))

## 0.4.5

- fix docs style
  ([commit](https://github.com/feltjs/felt/commit/05abe4bf4e30bfbba20a2398db1ec332ae477106))

## 0.4.4

- fix docs links
  ([#902](https://github.com/feltjs/felt/pull/902))
- improve docs rendering
  ([#900](https://github.com/feltjs/felt/pull/900))

## 0.4.3

- improve docs links
  ([#899](https://github.com/feltjs/felt/pull/899))

## 0.4.2

- improve docs scrolling feedback
  ([#894](https://github.com/feltjs/felt/pull/894))
- use `@fuz-dev/intersect` dependency
  ([#897](https://github.com/feltjs/felt/pull/897))

## 0.4.1

- improve `$lib/Docs.svelte`, adding slots `header` and `footer` and improving nav styles
  ([#892](https://github.com/feltjs/felt/pull/892))

## 0.4.0

- **break**: rename `$lib/docs.ts` from `$lib/guide.ts`
  ([#884](https://github.com/feltjs/felt/pull/884))

## 0.3.0

- **break**: upgrade deps `@fuz.dev/fuz@0.64.0` and `@grogarden/util@0.9.0`
  ([#889](https://github.com/feltjs/felt/pull/889))

## 0.2.1

- export `$lib/util/query.ts` and `$lib/docs/guide.ts`
  ([#884](https://github.com/feltjs/felt/pull/884),
  [#885](https://github.com/feltjs/felt/pull/885))
- change `$lib/Docs.svelte` to accept a base `path` prop
  that defaults to the current behavior, `/docs`
  ([#884](https://github.com/feltjs/felt/pull/884))

## 0.2.0

- **break**: move `$lib/app/` modules into `$lib/ui/`
  ([#825](https://github.com/feltjs/felt/pull/825))
- **break**: rename `$lib/app/components.ts` from `$lib/app/views.ts`
  ([#733](https://github.com/feltjs/felt/pull/733))
- **break**: move action-related modules to `$lib/vocab/actions/`
  ([#807](https://github.com/feltjs/felt/pull/807))
- publish migration files
  ([#591](https://github.com/feltjs/felt/pull/591))
- publish `$lib/Docs.svelte`
  ([#591](https://github.com/feltjs/felt/pull/591))

## 0.1.0

- publish
  ([#585](https://github.com/feltjs/felt/pull/585))
