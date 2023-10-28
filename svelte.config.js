//@ts-expect-error
import {typescript} from 'svelte-preprocess-esbuild';
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: typescript(),
	compilerOptions: {immutable: true},
	vitePlugin: {inspector: true}, // docs: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/inspector.md
	kit: {
		adapter: adapter({
			precompress: true,
			polyfill: false,
		}),
		alias: {$routes: 'src/routes', $fixtures: 'src/fixtures'},
	},
};
