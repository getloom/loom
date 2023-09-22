import {sveltekit} from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	ssr: {noExternal: ['@fuz.dev/fuz']},
	server: {
		proxy: {
			'/api': 'http://localhost:3000', // equal to `PUBLIC_API_SERVER_HOSTNAME + ':' + PUBLIC_API_SERVER_PORT`
		},
	},
};

export default config;
