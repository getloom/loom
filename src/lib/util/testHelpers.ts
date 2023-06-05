import sourcemapSupport from 'source-map-support';
import {Logger} from '@feltjs/util/log.js';
import {unwrap, type OmitStrict} from '@feltjs/util';
import * as assert from 'uvu/assert';

import {SessionApiMock} from '$lib/session/SessionApiMock';
import {BroadcastMock} from '$lib/server/BroadcastMock';
import {
	toServiceRequest,
	type AuthorizedServiceRequest,
	type ServiceRequest,
	type NonAuthenticatedServiceRequest,
	type NonAuthorizedServiceRequest,
} from '$lib/server/service';
import type {AccountActor, ActionActor} from '$lib/vocab/actor/actor';
import {ADMIN_HUB_ID, ADMIN_ACTOR_ID} from '$lib/app/constants';
import type {Repos} from '$lib/db/Repos';
import {toFailedApiResult, type FailedApiResult} from '$lib/server/api';
import type {AccountId} from '$lib/vocab/account/account';
import type {IBroadcast} from '$lib/server/Broadcast';
import type {HubId} from '$lib/vocab/hub/hub';
import {InviteToHubService} from '$lib/vocab/hub/hubServices';
import type {InviteToHubResponse} from '$lib/vocab/action/actionTypes';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

export const log = new Logger('[test]');
export const logError = new Logger('[test]', undefined, {...Logger, level: 'off'});

let installed = false;

export const installSourceMaps = (): void => {
	if (installed) return;
	installed = true;
	sourcemapSupport.install({
		handleUncaughtExceptions: false,
	});
};

export function toServiceRequestMock(
	repos: Repos,
	actor?: undefined,
	session?: SessionApiMock,
	account_id?: undefined,
	broadcast?: IBroadcast,
): OmitStrict<NonAuthenticatedServiceRequest, 'params'>;
export function toServiceRequestMock(
	repos: Repos,
	actor?: undefined,
	session?: SessionApiMock,
	account_id?: AccountId,
	broadcast?: IBroadcast,
): OmitStrict<NonAuthorizedServiceRequest, 'params'>;
export function toServiceRequestMock(
	repos: Repos,
	actor: ActionActor,
	session?: SessionApiMock,
	account_id?: AccountId,
	broadcast?: IBroadcast,
): OmitStrict<AuthorizedServiceRequest, 'params'>;
export function toServiceRequestMock(
	repos: Repos,
	actor?: ActionActor,
	session = new SessionApiMock(), // some tests need to reuse the same mock session
	account_id = actor?.account_id || undefined,
	broadcast: IBroadcast = new BroadcastMock(),
): OmitStrict<ServiceRequest, 'params'> {
	const {params: _, ...rest} = toServiceRequest(
		repos,
		undefined,
		account_id!,
		actor!,
		session,
		broadcast,
	);
	return rest;
}

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
			...toServiceRequestMock(repos, actor, undefined, undefined, broadcast),
			params: {actor: actor.actor_id, hub_id, name: invitedActorName},
		}),
	);
