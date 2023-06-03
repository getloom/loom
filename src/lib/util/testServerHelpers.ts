import polka from 'polka';
import {createServer} from 'http';
import {WebSocketServer} from 'ws';

import {ApiServer} from '$lib/server/ApiServer';
import {Websockets} from '$lib/server/Websockets';
import {services} from '$lib/server/services';
import {installSourceMaps, log} from '$lib/util/testHelpers';
import {Broadcast} from '$lib/server/Broadcast';
import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';

installSourceMaps();

/**
 * The `setupServer` test helper provides a superset of `setupDb`.
 * If a test suite only needs `repos` and `db`, use `setupDb` instead.
 */

// TODO we want to create this once and close it after all tests have run --
// maybe refactor to use the Felt obtainable helper --
// but how can we do that without an error-prone timeout?

const TEST_PORT = 3003;

export interface TestServerContext extends TestDbContext {
	server: ApiServer;
}

export const setupServer = async (context: TestServerContext): Promise<void> => {
	await setupDb(context);
	const server = createServer();
	context.server = new ApiServer({
		server,
		app: polka({server}),
		websockets: new Websockets(new WebSocketServer({server})),
		broadcast: new Broadcast(context.repos),
		db: context.db,
		port: TEST_PORT,
		services,
	});
	await context.server.init();
};

export const teardownServer = async (context: TestServerContext): Promise<void> => {
	const {server} = context;
	context.server = null!;
	try {
		await server.close();
	} catch (err) {
		log.error('error closing server', err);
	}
	await teardownDb(context);
};
