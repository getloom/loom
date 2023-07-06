import polka from 'polka';
import {createServer} from 'http';
import {WebSocketServer} from 'ws';
import * as assert from 'uvu/assert';

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
import {SignUpService} from '$lib/vocab/account/accountServices';
import type {SignUpResponse} from '$lib/vocab/action/actionTypes';
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

export interface TestHttpSession {
	auth: string;
	account: RandomTestAccount;
	actor: AccountActor;
}

// Creates a new account, actor, signs in, and returns the session.
// Any actions can be performed
export const initHttpSession = async (): Promise<TestHttpSession> => {
	const signUpRoute = SignUpService.action.route;
	const accountParams = randomAccountParams();
	const accountActorParams = randomActorParams();

	const signUpRes = await fetch(`http://localhost:${TEST_PORT}${signUpRoute.path}`, {
		method: signUpRoute.method,
		headers: {'content-type': 'application/json', accept: 'application/json'},
		body: JSON.stringify(accountParams),
	});
	assert.ok(signUpRes.ok);

	const auth = signUpRes.headers.get('set-cookie');
	if (!auth) {
		throw Error('cookie auth was not set correctly');
	}

	const signUpData: SignUpResponse = await signUpRes.json();
	const account = signUpData.session.account as RandomTestAccount;
	// This makes the unencrypted password available for tests,
	// so things like `SignIn` can be tested with existing accounts.
	account.__testPlaintextPassword = accountParams.password;

	const creatActorRoute = CreateAccountActorService.action.route;
	const createActorRes = await fetch(`http://localhost:${TEST_PORT}${creatActorRoute.path}`, {
		method: creatActorRoute.method,
		headers: {
			'content-type': 'application/json',
			accept: 'application/json',
			cookie: `${auth}`,
		},
		body: JSON.stringify(accountActorParams),
	});
	assert.ok(createActorRes.ok);
	const {actor} = await createActorRes.json();

	return {auth, account, actor};
};
