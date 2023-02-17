import sourcemapSupport from 'source-map-support';
import {Logger} from '@feltjs/util/log.js';
import {type OmitStrict, unwrap} from '@feltjs/util';

import {SessionApiMock} from '$lib/session/SessionApiMock';
import {
	toServiceRequest,
	type AuthorizedServiceRequest,
	type ServiceRequest,
	type NonAuthenticatedServiceRequest,
	type NonAuthorizedServiceRequest,
} from '$lib/server/service';
import type {AccountPersona, ActorPersona} from '$lib/vocab/persona/persona';
import {ADMIN_COMMUNITY_ID, ADMIN_PERSONA_ID} from '$lib/app/constants';
import type {Repos} from '$lib/db/Repos';

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
	repos: Repos,
	actor?: undefined,
	session?: SessionApiMock,
	account_id?: undefined,
): OmitStrict<NonAuthenticatedServiceRequest, 'params'>;
export function toServiceRequestMock(
	repos: Repos,
	actor?: undefined,
	session?: SessionApiMock,
	account_id?: number,
): OmitStrict<NonAuthorizedServiceRequest, 'params'>;
export function toServiceRequestMock(
	repos: Repos,
	actor: ActorPersona,
	session?: SessionApiMock,
	account_id?: number,
): OmitStrict<AuthorizedServiceRequest, 'params'>;
export function toServiceRequestMock(
	repos: Repos,
	actor?: ActorPersona,
	session = new SessionApiMock(), // some tests need to reuse the same mock session
	account_id = actor?.account_id || undefined,
): OmitStrict<ServiceRequest, 'params'> {
	const {params: _, ...rest} = toServiceRequest(repos, undefined, account_id!, actor!, session);
	return rest;
}

export const loadAdminPersona = async (repos: Repos): Promise<AccountPersona> => {
	const assignments = unwrap(await repos.assignment.filterByCommunity(ADMIN_COMMUNITY_ID));
	const nonAdminAssignments = assignments.filter((p) => p.persona_id !== ADMIN_PERSONA_ID);
	return unwrap(await repos.persona.findById(nonAdminAssignments[0].persona_id)) as AccountPersona;
};
