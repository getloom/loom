import {sveltekit} from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api': 'http://localhost:3000', // same as in src/lib/config.ts
		},
	},
};

export default config;
