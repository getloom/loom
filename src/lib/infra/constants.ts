// TODO these are awkward but at least easy to read and search for -
// they avoid importing Gro constants like `SERVER_DIST_PATH`
// because some are used in the `after_deploy` script,
// and we're currently avoiding a runtime dependency on Gro

/**
 * Keep in sync with the `server/server.ts` path.
 */
export const START_SERVER_SCRIPT_BUILD_PATH = 'dist_server/server/server.js';

/**
 * Keep in sync with the `infra/after_deploy.ts` path.
 */
export const AFTER_DEPLOY_SCRIPT_BUILD_PATH = 'dist_server/infra/after_deploy.js';

/**
 * Keep in sync with the `infra/after_deploy.ts` path.
 */
export const AFTER_DEPLOY_SCRIPT_SOURCE_PATH = 'src/lib/infra/after_deploy.ts';

/**
 * Keep in sync with the `plugin` path.
 */
export const TASKS_SOURCE_DIR = 'src/lib/tasks';
