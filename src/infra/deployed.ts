import {Logger} from '@feltcoop/util/log.js';

import {migrate} from '$lib/db/migrate';

// This script is designed to run after updating a production deployment.
// The filename needs to stay in sync with this constant: `DEPLOYED_SCRIPT_PATH`

// TODO consider making it a task instead (need changes to Gro to run js tasks directly)

const log = new Logger('[migrate]');

void migrate(log)
	.then(() => {
		log.info('deployed!');
	})
	.catch((err) => {
		log.error(err);
		throw err;
	});
