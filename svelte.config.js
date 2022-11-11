import {typescript} from 'svelte-preprocess-esbuild';
import node from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: typescript(),
	compilerOptions: {immutable: true},
	kit: {
		adapter: node(),
		files: {assets: 'src/static'},
	},
};
