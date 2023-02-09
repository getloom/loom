import {Logger} from '@feltjs/util/log.js';

import {migrate} from '$lib/db/migrate';
import {db} from '$lib/db/db';

// This script is designed to run after updating a production deployment.
// The filename needs to stay in sync with this constant: `DEPLOYED_SCRIPT_PATH`

const log = new Logger('[migrate]');

const main = async () => {
	log.info('running post-deploy script');
	await migrate(true, log);
	log.info('deployed!');
	await db.close();
};

main().catch((err) => {
	log.error(err);
	throw err;
});
