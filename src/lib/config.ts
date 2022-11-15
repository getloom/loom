// TODO This module is going to change significantly:
// - figure out how to allow user projects to override these vars
// - it should not be imported on the client, instead the values should be replaced at build time

// TODO Replace this at buildtime with a constant so it can be optimized.
// This probably means supporting `import.meta.env` or `$app/environment` in Gro.

const dev = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production'; // TODO fixme in multiple places to use `$app/environment`

export const PUBLIC_DEPLOY_SERVER_HOST = import.meta.env
	? import.meta.env.PUBLIC_DEPLOY_SERVER_HOST
	: process.env.PUBLIC_DEPLOY_SERVER_HOST;

export const PUBLIC_GIT_HASH = import.meta.env
	? import.meta.env.PUBLIC_GIT_HASH
	: process.env.PUBLIC_GIT_HASH;

export const API_SERVER_PORT = 3000; // same as in vite.config.js
export const API_SERVER_HOST = `localhost:${API_SERVER_PORT}`;
export const WEBSOCKET_URL_DEV = `ws://localhost:${API_SERVER_PORT}/ws`;
export const WEBSOCKET_URL_PROD = `wss://${PUBLIC_DEPLOY_SERVER_HOST}/ws`;
export const WEBSOCKET_URL = dev ? WEBSOCKET_URL_DEV : WEBSOCKET_URL_PROD;
