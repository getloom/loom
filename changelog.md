# changelog

## 0.4.1

- improve `$lib/Docs.svelte`, adding slots `header` and `footer` and improving nav styles
  ([#892](https://github.com/feltjs/felt-server/pull/892))

## 0.4.0

- **break**: rename `$lib/docs.ts` from `$lib/guide.ts`
  ([#884](https://github.com/feltjs/felt-server/pull/884))

## 0.3.0

- **break**: upgrade deps `@feltjs/felt-ui@0.64.0` and `@feltjs/util@0.9.0`
  ([#889](https://github.com/feltjs/felt-server/pull/889))

## 0.2.1

- export `$lib/util/query.ts` and `$lib/docs/guide.ts`
  ([#884](https://github.com/feltjs/felt-server/pull/884),
  [#885](https://github.com/feltjs/felt-server/pull/885))
- change `$lib/Docs.svelte` to accept a base `path` prop
  that defaults to the current behavior, `/docs`
  ([#884](https://github.com/feltjs/felt-server/pull/884))

## 0.2.0

- **break**: move `$lib/app/` modules into `$lib/ui/`
  ([#825](https://github.com/feltjs/felt-server/pull/825))
- **break**: rename `$lib/app/components.ts` from `$lib/app/views.ts`
  ([#733](https://github.com/feltjs/felt-server/pull/733))
- **break**: move action-related modules to `$lib/vocab/actions/`
  ([#807](https://github.com/feltjs/felt-server/pull/807))
- publish migration files
  ([#591](https://github.com/feltjs/felt-server/pull/591))
- publish `$lib/Docs.svelte`
  ([#591](https://github.com/feltjs/felt-server/pull/591))

## 0.1.0

- publish
  ([#585](https://github.com/feltjs/felt-server/pull/585))
