import {suite} from 'uvu';
import * as t from 'uvu/assert';

import {ApiServer} from './ApiServer.js';

const TEST_PORT = 3003; // TODO

/* test_ApiServer */
const test_ApiServer = suite('ApiServer');

test_ApiServer('init and destroy', async () => {
	const server = new ApiServer({port: TEST_PORT});
	t.is(server.config.port, TEST_PORT);
	await server.init();
	// TODO make API requests, and look into before/after
	await server.destroy();
});

test_ApiServer.run();
/* /test_ApiServer */
