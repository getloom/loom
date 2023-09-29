import {Logger} from '@grogarden/util/log.js';

import {migrate} from '$lib/db/migrate';
import {db} from '$lib/db/db';

const log = new Logger('[migrate]');

/**
 * This script runs after updating a production deployment to do finalization like migrations.
 * See `npm run after_deploy` for its usage.
 * This module's path must remain synced with
 * `AFTER_DEPLOY_SCRIPT_SOURCE_PATH` and `AFTER_DEPLOY_SCRIPT_BUILD_PATH`.
 */
const main = async () => {
	log.info('running after_deploy script');
	await migrate(true, log);
	log.info('deployed!');
	await db.close();
};

main().catch((err) => {
	log.error(err);
	throw err;
});
