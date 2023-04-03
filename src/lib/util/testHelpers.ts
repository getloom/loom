import sourcemapSupport from 'source-map-support';
import {Logger} from '@feltjs/util/log.js';
import type {OmitStrict} from '@feltjs/util';
import * as assert from 'uvu/assert';

import {SessionApiMock} from '$lib/session/SessionApiMock';
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
import type {ApiError} from '$lib/server/api';
import type {AccountId} from '$lib/vocab/account/account';

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
): OmitStrict<NonAuthenticatedServiceRequest, 'params'>;
export function toServiceRequestMock(
	repos: Repos,
	actor?: undefined,
	session?: SessionApiMock,
	account_id?: AccountId,
): OmitStrict<NonAuthorizedServiceRequest, 'params'>;
export function toServiceRequestMock(
	repos: Repos,
	actor: ActionActor,
	session?: SessionApiMock,
	account_id?: AccountId,
): OmitStrict<AuthorizedServiceRequest, 'params'>;
export function toServiceRequestMock(
	repos: Repos,
	actor?: ActionActor,
	session = new SessionApiMock(), // some tests need to reuse the same mock session
	account_id = actor?.account_id || undefined,
): OmitStrict<ServiceRequest, 'params'> {
	const {params: _, ...rest} = toServiceRequest(repos, undefined, account_id!, actor!, session);
	return rest;
}

export const loadAdminPersona = async (repos: Repos): Promise<AccountActor> => {
	const assignments = await repos.assignment.filterByHub(ADMIN_HUB_ID);
	const nonAdminAssignments = assignments.filter((p) => p.persona_id !== ADMIN_ACTOR_ID);
	return repos.persona.findById(nonAdminAssignments[0].persona_id) as Promise<AccountActor>;
};

export const expectApiError = async (status: number, cb: () => Promise<any>): Promise<void> => {
	let error: ApiError | undefined;
	try {
		await cb();
	} catch (err) {
		error = err;
	}
	assert.ok(error);
	assert.is(error.status, status);
};

export const expectError = async (promise: Promise<any>): Promise<void> => {
	let error: Error | undefined;
	try {
		await promise;
	} catch (err) {
		error = err;
	}
	if (!error) {
		throw Error('expected error');
	}
};
