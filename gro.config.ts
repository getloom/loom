import type {Create_Gro_Config} from '@grogarden/gro';
import {readdir} from 'node:fs/promises';
import {plugin as gro_plugin_server, SERVER_SOURCE_ID} from '@grogarden/gro/gro_plugin_server.js';
import {plugin as gro_plugin_sveltekit_frontend} from '@grogarden/gro/gro_plugin_sveltekit_frontend.js';
import {plugin as gro_plugin_library} from '@grogarden/gro/gro_plugin_library.js';

import {MIGRATIONS_DIR} from '$lib/db/migration.js';
import {init_env} from '$lib/server/env.js';
import {
	AFTER_DEPLOY_SCRIPT_BUILD_PATH,
	AFTER_DEPLOY_SCRIPT_SOURCE_PATH,
	START_SERVER_SCRIPT_BUILD_PATH,
} from '$lib/infra/constants.js';

/**
 * @see https://github.com/grogarden/gro/blob/main/src/lib/docs/config.md
 */
const config: Create_Gro_Config = async (cfg) => {
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
		gro_plugin_library(),
	];

	cfg.map_package_json = (pkg) => {
		pkg.scripts!.start = `node ${START_SERVER_SCRIPT_BUILD_PATH}`;
		pkg.scripts!.after_deploy = `node ${AFTER_DEPLOY_SCRIPT_BUILD_PATH}`;
		return pkg;
	};

	return cfg;
};

export default config;
