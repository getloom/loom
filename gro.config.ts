import type {GroConfigCreator} from '@grogarden/gro';
import {readdir} from 'node:fs/promises';
import {plugin as gro_plugin_server, SERVER_SOURCE_ID} from '@grogarden/gro/gro_plugin_server.js';
import {plugin as gro_plugin_sveltekit_frontend} from '@grogarden/gro/gro_plugin_sveltekit_frontend.js';

import {MIGRATIONS_DIR} from '$lib/db/migration';
import {init_env} from '$lib/server/env';
import {
	AFTER_DEPLOY_SCRIPT_BUILD_PATH,
	AFTER_DEPLOY_SCRIPT_SOURCE_PATH,
	START_SERVER_SCRIPT_BUILD_PATH,
} from '$lib/infra/constants';

/**
 * @see https://github.com/grogarden/gro/blob/main/src/lib/docs/config.md
 */
const config: GroConfigCreator = async (cfg) => {
	await init_env();

	const entry_points: string[] = [
		// $lib/server/server.ts
		SERVER_SOURCE_ID,

		// see `npm run after_deploy`
		AFTER_DEPLOY_SCRIPT_SOURCE_PATH,

		// include all migration files
		...(await readdir(MIGRATIONS_DIR)).map((m) => MIGRATIONS_DIR + '/' + m),
	];

	cfg.plugins = async () => [
		// TODO could replace just the server plugin to be more forwards compatible, `replace_plugin` helper?
		// a problem with this design is that users could use it in ways that break often, like even when new base plugins are added
		gro_plugin_server({entry_points}),
		gro_plugin_sveltekit_frontend(),
	];

	cfg.package_json = (pkg) => {
		pkg.scripts!.start = `node ${START_SERVER_SCRIPT_BUILD_PATH}`;
		pkg.scripts!.after_deploy = `node ${AFTER_DEPLOY_SCRIPT_BUILD_PATH}`;
		pkg.exports = {
			'./ui/ErrorMessage.svelte': {
				svelte: './dist/ui/ErrorMessage.svelte',
				types: './dist/ui/ErrorMessage.svelte.d.ts',
			},
			'./vocab/schemas.js': {
				default: './dist/vocab/schemas.js',
				types: './dist/vocab/schemas.d.ts',
			},
			'./vocab/action/actions.js': {
				default: './dist/vocab/action/actions.js',
				types: './dist/vocab/action/actions.d.ts',
			},
			'./util/deserialize.js': {
				default: './dist/util/deserialize.js',
				types: './dist/util/deserialize.d.ts',
			},
			'./util/query.js': {
				default: './dist/util/query.js',
				types: './dist/util/query.d.ts',
			},
			'./vocab/account/account.js': {
				default: './dist/vocab/account/account.js',
				types: './dist/vocab/account/account.d.ts',
			},
			'./docs/Docs.svelte': {
				svelte: './dist/docs/Docs.svelte',
				types: './dist/docs/Docs.svelte.d.ts',
			},
			'./docs/docs.js': {
				default: './dist/docs/docs.js',
				types: './dist/docs/docs.d.ts',
			},
		};
		return pkg;
	};

	return cfg;
};

export default config;
