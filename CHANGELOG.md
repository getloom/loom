# @feltjs/felt

## 0.14.0

### Minor Changes

- upgrade deps ([#959](https://github.com/feltjs/felt/pull/959))
- upgrade gro ([#958](https://github.com/feltjs/felt/pull/958))

## 0.13.0

### Minor Changes

- delete the `gro deploy` override for `gro infra/deploy` ([#955](https://github.com/feltjs/felt/pull/955))

### Patch Changes

- improve docs ([#956](https://github.com/feltjs/felt/pull/956))

## 0.12.3

### Patch Changes

- upgrade deps ([d3249fd5](https://github.com/feltjs/felt/commit/d3249fd5))

## 0.12.2

### Patch Changes

- upgrade types ([7da37ea1](https://github.com/feltjs/felt/commit/7da37ea1))

## 0.12.1

### Patch Changes

- upgrade deps ([60ed66a5](https://github.com/feltjs/felt/commit/60ed66a5))

## 0.12.0

### Minor Changes

- upgrade deps ([b8a4cdbe](https://github.com/feltjs/felt/commit/b8a4cdbe))

## 0.11.2

### Patch Changes

- add icon 💚 ([dc1f1d3f](https://github.com/feltjs/felt/commit/dc1f1d3f))

## 0.11.1

### Patch Changes

- export all modules ([6d76fdba](https://github.com/feltjs/felt/commit/6d76fdba))

## 0.11.0

### Minor Changes

- upgrade deps ([c49309b3](https://github.com/feltjs/felt/commit/c49309b3))

## 0.10.0

### Minor Changes

- upgrade deps ([a50aac54](https://github.com/feltjs/felt/commit/a50aac54))

## 0.9.5

### Patch Changes

- add package summary to intro docs ([f68d9c00](https://github.com/feltjs/felt/commit/f68d9c00))

## 0.9.4

### Patch Changes

- update docs ([3f7f3a15](https://github.com/feltjs/felt/commit/3f7f3a15))

## 0.9.3

### Patch Changes

- upgrade deps which adds `modules` to `package.json` ([#954](https://github.com/feltjs/felt/pull/954))

## 0.9.2

### Patch Changes

- switch to `@feltjs/felt_mural` ([4b8cc9bf](https://github.com/feltjs/felt/commit/4b8cc9bf))

## 0.9.1

### Patch Changes

- add peer dep `@sveltejs/kit` ([a4711458](https://github.com/feltjs/felt/commit/a4711458))
- add and export `$lib/package.ts` ([a4711458](https://github.com/feltjs/felt/commit/a4711458))

## 0.9.0

### Minor Changes

- upgrade deps ([67f9143b](https://github.com/feltjs/felt/commit/67f9143b))

## 0.8.5

### Patch Changes

- export modules for docs ([a932fbb8](https://github.com/feltjs/felt/commit/a932fbb8))

## 0.8.4

### Patch Changes

- export ui/style.css ([14c7c593](https://github.com/feltjs/felt/commit/14c7c593))

## 0.8.3

### Patch Changes

- fix import paths ([#950](https://github.com/feltjs/felt/pull/950))

## 0.8.2

### Patch Changes

- add gro library plugin to fix published dist ([3c9cbce6](https://github.com/feltjs/felt/commit/3c9cbce6))

## 0.8.1

### Patch Changes

- include dist in published package ([43e788af](https://github.com/feltjs/felt/commit/43e788af))

## 0.8.0

### Minor Changes

- upgrade `@grogarden/util@0.15` from `0.13` ([#922](https://github.com/feltjs/felt/pull/922))
- rename `@fuz.dev/svelte_intersect` from `@fuz.dev/svelte-intersect` ([#922](https://github.com/feltjs/felt/pull/922))

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
