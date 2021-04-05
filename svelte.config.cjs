const {typescript} = require('svelte-preprocess-esbuild');
const node = require('@sveltejs/adapter-node');
const pkg = require('./package.json');

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
	preprocess: typescript(), // TODO mdsvex
	kit: {
		adapter: node(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		vite: {
			ssr: {
				noExternal: Object.keys(pkg.dependencies || {}),
			},
			server: {
				proxy: {
					'/api': 'http://localhost:3001/',
				},
			},
		},
	},
};
