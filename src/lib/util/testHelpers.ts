import {Logger} from '@ryanatkn/belt/log.js';
import type {Omit_Strict} from '@ryanatkn/belt/types.js';
import {unwrap} from '@ryanatkn/belt/result.js';
import * as assert from 'uvu/assert';
import {noop} from '@ryanatkn/belt/function.js';
// TODO followup
// import sourcemapSupport from 'source-map-support';

import {SessionApiFake} from '$lib/session/SessionApiFake.js';
import {BroadcastFake} from '$lib/server/BroadcastFake.js';
import {
	toServiceRequest,
	type AuthorizedServiceRequest,
	type NonAuthenticatedServiceRequest,
	type NonAuthorizedServiceRequest,
	type AfterResponse,
} from '$lib/server/service.js';
import type {AccountActor, ActionActor} from '$lib/vocab/actor/actor.js';
import {ADMIN_HUB_ID, ADMIN_ACTOR_ID} from '$lib/util/constants.js';
import type {Repos} from '$lib/db/Repos.js';
import {toFailedApiResult, type FailedApiResult} from '$lib/server/api.js';
import type {AccountId} from '$lib/vocab/account/account.js';
import type {IBroadcast} from '$lib/server/Broadcast.js';
import type {HubId} from '$lib/vocab/hub/hub.js';
import {InviteToHubService} from '$lib/vocab/hub/hubServices.js';
import type {InviteToHubResponse} from '$lib/vocab/action/actionTypes.js';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server.js';
import {toPasswordKey, verifyPassword} from '$lib/server/password.js';
import type {PasswordHasher} from '$lib/server/password_hasher.js';

export const log = new Logger('[test]');
export const logError = new Logger('[test]', undefined, {...Logger, level: 'off'});

let installed = false;

export const installSourceMaps = (): void => {
	if (installed) return;
	installed = true;
	// TODO followup
	// sourcemapSupport.install({
	// 	handleUncaughtExceptions: false,
	// });
};

export interface ToServiceRequestFake {
	(
		repos: Repos,
		actor?: undefined,
		account_id?: undefined,
		session?: SessionApiFake,
		broadcast?: IBroadcast,
		passwordHasher?: PasswordHasher,
		afterResponse?: AfterResponse,
	): Omit_Strict<NonAuthenticatedServiceRequest, 'params'>;
	(
		repos: Repos,
		actor?: undefined,
		account_id?: AccountId,
		session?: SessionApiFake,
		broadcast?: IBroadcast,
		passwordHasher?: PasswordHasher,
		afterResponse?: AfterResponse,
	): Omit_Strict<NonAuthorizedServiceRequest, 'params'>;
	(
		repos: Repos,
		actor: ActionActor,
		account_id?: AccountId,
		session?: SessionApiFake,
		broadcast?: IBroadcast,
		passwordHasher?: PasswordHasher,
		afterResponse?: AfterResponse,
	): Omit_Strict<AuthorizedServiceRequest, 'params'>;
}

export const toServiceRequestFake: ToServiceRequestFake = (
	repos,
	actor,
	account_id = actor?.account_id || undefined,
	session = new SessionApiFake(), // some tests need to reuse the same fake session
	broadcast = new BroadcastFake(),
	passwordHasher = passwordHasherFake,
	afterResponse = noop,
) => {
	const {params: _, ...rest} = toServiceRequest(
		repos,
		undefined,
		account_id,
		actor,
		session,
		broadcast,
		passwordHasher,
		afterResponse,
	);
	return rest as any;
};

/**
 * Creates a `PasswordHasher` that runs on the main thread and doesn't need teardown.
 */
export const passwordHasherFake: PasswordHasher = {
	encrypt: toPasswordKey,
	verify: verifyPassword,
	close: async () => undefined,
};

export const loadAdminActor = async (repos: Repos): Promise<AccountActor> => {
	const assignments = await repos.assignment.filterByHub(ADMIN_HUB_ID);
	const nonAdminAssignments = assignments.filter((p) => p.actor_id !== ADMIN_ACTOR_ID);
	return repos.actor.findById(
		nonAdminAssignments[0].actor_id,
		ACTOR_COLUMNS.all,
	) as Promise<AccountActor>;
};

export const expectApiError = async (status: number, promise: Promise<any>): Promise<void> => {
	let error: FailedApiResult | undefined;
	try {
		const result = await promise;
		if (result && 'ok' in result) {
			unwrap(result);
		}
	} catch (err) {
		error = toFailedApiResult(err);
	}
	assert.ok(error);
	assert.is(error.status, status);
};

export const expectError = async (promise: Promise<any>): Promise<void> => {
	let error: Error | undefined;
	try {
		const result = await promise;
		if (result && 'ok' in result) {
			unwrap(result);
		}
	} catch (err) {
		error = err;
	}
	if (!error) {
		throw Error('expected error');
	}
};

/**
 * This test helper reduces boilerplate and ensures the correct actor is passed in the params.
 */
export const invite = async (
	repos: Repos,
	actor: AccountActor,
	hub_id: HubId,
	invitedActorName: string,
	broadcast?: IBroadcast,
): Promise<InviteToHubResponse> =>
	unwrap(
		await InviteToHubService.perform({
			...toServiceRequestFake(repos, actor, undefined, undefined, broadcast),
			params: {actor: actor.actor_id, hub_id, name: invitedActorName},
		}),
	);
