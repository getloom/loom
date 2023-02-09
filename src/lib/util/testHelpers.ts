import sourcemapSupport from 'source-map-support';
import {configureLogLevel, Logger, LogLevel} from '@feltjs/util/log.js';
import type {OmitStrict} from '@feltjs/util';

import {SessionApiMock} from '$lib/session/SessionApiMock';
import type {Database} from '$lib/db/Database';
import {
	toServiceRequest,
	type AuthorizedServiceRequest,
	type ServiceRequest,
	type NonAuthenticatedServiceRequest,
	type NonAuthorizedServiceRequest,
} from '$lib/server/service';
import type {ActorPersona} from '$lib/vocab/persona/persona';

configureLogLevel(LogLevel.Info);

export const log = new Logger('[test]');

let installed = false;

export const installSourceMaps = (): void => {
	if (installed) return;
	installed = true;
	sourcemapSupport.install({
		handleUncaughtExceptions: false,
	});
};

export function toServiceRequestMock(
	db: Database,
	actor?: undefined,
	session?: SessionApiMock,
	account_id?: undefined,
): OmitStrict<NonAuthenticatedServiceRequest, 'params'>;
export function toServiceRequestMock(
	db: Database,
	actor?: undefined,
	session?: SessionApiMock,
	account_id?: number,
): OmitStrict<NonAuthorizedServiceRequest, 'params'>;
export function toServiceRequestMock(
	db: Database,
	actor: ActorPersona,
	session?: SessionApiMock,
	account_id?: number,
): OmitStrict<AuthorizedServiceRequest, 'params'>;
export function toServiceRequestMock(
	db: Database,
	actor?: ActorPersona,
	session = new SessionApiMock(), // some tests need to reuse the same mock session
	account_id = actor?.account_id || undefined,
): OmitStrict<ServiceRequest, 'params'> {
	const {params: _, ...rest} = toServiceRequest(db, undefined, account_id!, actor!, session);
	return rest;
}
