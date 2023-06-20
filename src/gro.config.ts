import type {GroConfigCreator} from '@feltjs/gro';

import {MIGRATIONS_DIR, MIGRATIONS_PATH} from '$lib/db/migration';
import {DEPLOYED_SCRIPT_PATH} from '$lib/infra/helpers';

const API_SERVER_BUILD_NAME = 'server';
const NODE_LIBRARY_BUILD_NAME = 'library';

const files = [
	'lib/index.ts', // same as 'lib/server/server.ts'

	// exported user modules
	'lib/db/db.ts',
	'lib/server/server.ts',
	'lib/ui/AccountForm.svelte',
	'lib/ui/ActingActorContextmenu.svelte',
	'lib/ui/AppContextmenu.svelte',
	'lib/ui/ErrorMessage.svelte',
	'lib/ui/HttpApiClient.ts',
	'lib/ui/Luggage.svelte',
	'lib/ui/MainNav.svelte',
	'lib/ui/Onboard.svelte',
	'lib/ui/SchemaInfo.svelte',
	'lib/ui/SocketConnection.svelte',
	'lib/ui/WebsocketApiClient.ts',
	'lib/ui/app.ts',
	'lib/ui/components.ts',
	'lib/ui/mutations.ts',
	'lib/ui/services.ts',
	'lib/ui/socket.ts',
	'lib/ui/style.css',
	'lib/ui/syncUiToUrl.ts',
	'lib/ui/ui.ts',
	'lib/util/color.ts',
	'lib/util/deserialize.ts',
	'lib/util/url.ts',
	'lib/vocab/action/actionData.ts',
	'lib/vocab/action/actions.ts',
	'lib/vocab/schemas.ts',

	// tasks
	'lib/db/create.task.ts',
	'lib/db/destroy.task.ts',
	'lib/db/migrate.task.ts',
	'lib/db/seed.task.ts',
	'lib/db/testMigration.task.ts',
	'lib/infra/deploy.task.ts',
	'lib/infra/setup.task.ts',
	'lib/infra/syncEnvGitHash.task.ts',
];

const config: GroConfigCreator = async ({config, fs, dev}) => {
	// Production bundle includes more than just the default server entrypoint.
	if (!dev) {
		const serverBuildConfig = config.builds.find((b) => b.name === API_SERVER_BUILD_NAME);
		if (!serverBuildConfig) {
			throw Error('Expected to find build config with name ' + API_SERVER_BUILD_NAME);
		}

		// Server bundle includes the post-deploy script at `src/lib/infra/deployed.ts`:
		serverBuildConfig.input.push(DEPLOYED_SCRIPT_PATH + '.ts');

		const libraryBuildConfig = config.builds.find((b) => b.name === NODE_LIBRARY_BUILD_NAME);
		if (!libraryBuildConfig) {
			throw Error('Expected to find build config with name ' + NODE_LIBRARY_BUILD_NAME);
		}
		libraryBuildConfig.input.length = 0; // TODO could do assignment in a one-liner if the gro type was changed to not be readonly
		libraryBuildConfig.input.push(...files); // TODO could do assignment in a one-liner if the gro type was changed to not be readonly

		// Both the server and library bundles include all migration files:
		const migrationFiles = await fs.readDir(MIGRATIONS_DIR);
		for (const migrationFile of migrationFiles) {
			const migrationFilePath = MIGRATIONS_PATH + '/' + migrationFile;
			serverBuildConfig.input.push(migrationFilePath);
			libraryBuildConfig.input.push(migrationFilePath);
		}
	}

	return config;
};

export default config;
