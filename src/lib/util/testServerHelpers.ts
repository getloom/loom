import polka from 'polka';
import {createServer} from 'http';
import {WebSocketServer} from 'ws';

import {ApiServer} from '$lib/server/ApiServer';
import {Websockets} from '$lib/server/Websockets';
import {services} from '$lib/server/services';
import {installSourceMaps, log} from '$lib/util/testHelpers';
import {Broadcast} from '$lib/server/Broadcast';
import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {AccountActor} from '$lib/vocab/actor/actor';
import {
	randomAccountParams,
	randomActorParams,
	type RandomTestAccount,
} from '$lib/util/randomVocab';
import {SignInService, SignUpService} from '$lib/vocab/account/accountServices';
import type {CreateAccountActorResponse, SignUpResponse} from '$lib/vocab/action/actionTypes';
import {CreateAccountActorService} from '$lib/vocab/actor/actorServices';

installSourceMaps();

/**
 * The `setupServer` test helper provides a superset of `setupDb`.
 * If a test suite only needs `repos` and `db`, use `setupDb` instead.
 */

// TODO we want to create this once and close it after all tests have run --
// maybe refactor to use the Felt obtainable helper --
// but how can we do that without an error-prone timeout?

export const TEST_PORT = 3003;

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

export const initHttp = async (): Promise<{
	auth: string;
	account: RandomTestAccount;
	actor: AccountActor;
}> => {
	const signUpRoute = SignUpService.action.route;
	const accountParams = randomAccountParams();
	const accountActorParams = randomActorParams();
	const res1 = await fetch(`http://localhost:${TEST_PORT}${signUpRoute.path}`, {
		method: signUpRoute.method,
		headers: {'content-type': 'application/json'},
		body: JSON.stringify(accountParams),
	});

	const auth = res1.headers.get('set-cookie');
	if (!auth) {
		throw Error('cookie auth was not set appropriatly');
	}
	const data1 = (await res1.json()) as SignUpResponse;
	const account = data1.session.account as RandomTestAccount;
	account.__testPlaintextPassword = accountParams.password;

	const signInRoute = SignInService.action.route;
	await fetch(`http://localhost:${TEST_PORT}${signInRoute.path}`, {
		method: signInRoute.method,
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(accountParams),
	});

	const creatActorRoute = CreateAccountActorService.action.route;
	const res3 = await fetch(`http://localhost:${TEST_PORT}${creatActorRoute.path}`, {
		method: creatActorRoute.method,
		headers: {
			'content-type': 'application/json',
			Cookie: `${auth}`,
			Accept: 'application/json',
		},
		body: JSON.stringify(accountActorParams),
	});

	const data2 = (await res3.json()) as CreateAccountActorResponse;
	const actor = data2.actors[0] as AccountActor;

	return {auth, account, actor};
};
