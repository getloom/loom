import type {GroConfigCreator} from '@feltcoop/gro';
import {API_SERVER_BUILD_NAME} from '@feltcoop/gro/dist/build/buildConfigDefaults.js';

import {MIGRATIONS_DIR, MIGRATIONS_PATH} from '$lib/db/migration';
import {DEPLOYED_SCRIPT_PATH} from './infra/helpers';

const config: GroConfigCreator = async ({config, fs, dev}) => {
	// Production bundle includes more than just the default server entrypoint.
	if (!dev) {
		const buildConfig = config.builds.find((b) => b.name === API_SERVER_BUILD_NAME);
		if (!buildConfig) {
			throw Error('Expected to find build config with name ' + API_SERVER_BUILD_NAME);
		}
		const addFile = (path: string): void => {
			buildConfig.input.push(path);
		};

		// Production bundle includes the post-deploy script at `src/infra/deployed.ts`:
		addFile(DEPLOYED_SCRIPT_PATH + '.ts');

		// Production bundle includes all migration files:
		const migrationFiles = await fs.readDir(MIGRATIONS_DIR);
		for (const migrationFile of migrationFiles) {
			addFile(MIGRATIONS_PATH + '/' + migrationFile);
		}
	}

	return config;
};

export default config;
