import type {Logger} from '@feltjs/util/log.js';
import type {Result} from '@feltjs/util/result.js';

import type {ServiceActionData} from '$lib/vocab/action/action';
import type {ISessionApi} from '$lib/session/SessionApi';
import {Repos} from '$lib/db/Repos';
import type {ActionActor} from '$lib/vocab/actor/actor';
import {type ApiResult, toFailedApiResult} from '$lib/server/api';
import type {AccountId} from '$lib/vocab/account/account';
import type {ErrorResponse} from '$lib/util/error';
import type {HubId} from '$lib/vocab/hub/hub';
import type {IBroadcastApi} from '$lib/server/Broadcast';
import type {PasswordHasher} from '$lib/server/password';
import type {PolicyName} from '$lib/vocab/policy/policy';
import {checkHubAccessForActor, checkPolicyForActor} from '$lib/vocab/policy/policyHelpers.server';

export type BroadcastAudience = HubId | HubId[]; // TODO expand to `| {audience: BroadcastAudience; data: T}`

/**
 * This is the same as `ApiResult` with the additional `broadcast` key added.
 * This is a server-only type, unlike the client-facing `ApiResult`.
 */
export type ServiceResult<TValue = any> = Result<
	{status: number; value: TValue; broadcast?: BroadcastAudience}, // TODO make `broadcast` required after implementing for all services
	{status: number} & ErrorResponse
>;

/**
 * Converts a server-only `ServiceResult` to a client-facing `ApiResult`.
 * @param serviceResult
 * @returns an ApiResult
 */
export const toApiResult = <T>(serviceResult: ServiceResult<T>): ApiResult<T> =>
	serviceResult.ok
		? {ok: true, status: serviceResult.status, value: serviceResult.value}
		: serviceResult;

/**
 * Calls `perform` for a `service` by providing its dependencies,
 * including `repos` wrapped in a transaction as needed.
 */
export const performService = async (
	service: Service,
	serviceRequest: ServiceRequest,
	log?: Logger,
): Promise<ServiceResult> => {
	let result!: ServiceResult;
	try {
		if (service.transaction) {
			await serviceRequest.repos.sql.begin(async (sql) => {
				serviceRequest.repos = new Repos(sql);
				result = await service.perform(serviceRequest as any);
				if (!result.ok) throw Error(); // cancel the transaction; the error is caught and swallowed ahead
			});
		} else {
			result = await service.perform(serviceRequest as any);
		}
		if (!result.ok) {
			log?.error('service.perform failed with a message', service.action.name, result.message);
		}
		return result;
	} catch (err) {
		log?.error('service.perform failed with an error', service.action.name, err);
		return result || toFailedApiResult(err);
	}
};

export type ServiceMethod =
	| 'GET'
	| 'HEAD'
	| 'PATCH'
	| 'OPTIONS'
	| 'CONNECT'
	| 'DELETE'
	| 'TRACE'
	| 'POST'
	| 'PUT';

// A `Service` can be reused across both http and websocket handlers.
// The generics are required to avoid mistakes with service definitions.
export type Service = NonAuthenticatedService | NonAuthorizedService | AuthorizedService;
export interface NonAuthenticatedService<
	TParams extends object | null = any,
	TResult extends ServiceResult = ServiceResult,
> {
	action: ServiceActionData;
	transaction: boolean;
	perform: (serviceRequest: NonAuthenticatedServiceRequest<TParams>) => Promise<TResult>;
}
export interface NonAuthorizedService<
	TParams extends object | null = any,
	TResult extends ServiceResult = ServiceResult,
> {
	action: ServiceActionData;
	transaction: boolean;
	perform: (serviceRequest: NonAuthorizedServiceRequest<TParams>) => Promise<TResult>;
}
export interface AuthorizedService<
	TParams extends object | null = any,
	TResult extends ServiceResult = ServiceResult,
> {
	action: ServiceActionData;
	transaction: boolean;
	perform: (serviceRequest: AuthorizedServiceRequest<TParams>) => Promise<TResult>;
}

export type ServiceRequest =
	| NonAuthenticatedServiceRequest
	| NonAuthenticatedServiceRequest
	| AuthorizedServiceRequest;
export interface NonAuthenticatedServiceRequest<TParams = any> {
	repos: Repos;
	params: TParams;
	session: ISessionApi;
	broadcast: IBroadcastApi;
	passwordHasher: PasswordHasher;
}
export interface NonAuthorizedServiceRequest<TParams = any>
	extends NonAuthenticatedServiceRequest<TParams> {
	account_id: AccountId;
}
export interface AuthorizedServiceRequest<TParams = any>
	extends NonAuthorizedServiceRequest<TParams> {
	actor: ActionActor;
	checkPolicy: (name: PolicyName, hub_id: HubId) => Promise<void>;
	checkHubAccess: (hub_id: HubId) => Promise<void>;
}

export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: undefined,
	actor: undefined,
	session: ISessionApi,
	broadcast: IBroadcastApi,
	passwordHasher: PasswordHasher,
): NonAuthenticatedServiceRequest<TParams>;
export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: AccountId,
	actor: undefined,
	session: ISessionApi,
	broadcast: IBroadcastApi,
	passwordHasher: PasswordHasher,
): NonAuthorizedServiceRequest<TParams>;
export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: AccountId,
	actor: ActionActor,
	session: ISessionApi,
	broadcast: IBroadcastApi,
	passwordHasher: PasswordHasher,
): AuthorizedServiceRequest<TParams>;
export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: AccountId | undefined,
	actor: ActionActor | undefined,
	session: ISessionApi,
	broadcast: IBroadcastApi,
	passwordHasher: PasswordHasher,
): ServiceRequest {
	const req: NonAuthenticatedServiceRequest = {repos, params, session, broadcast, passwordHasher};

	if (account_id) {
		// NonAuthorizedServiceRequest or AuthorizedServiceRequest
		(req as NonAuthorizedServiceRequest).account_id = account_id;
		if (actor) {
			// AuthorizedServiceRequest
			(req as AuthorizedServiceRequest).actor = actor;
			// TODO consider a `CheckApi` like `SessionApi` to group these helpers, if we add a 3rd,
			// or consider merging `checkHubAccess` into `checkPolicy` if that makes sense
			(req as AuthorizedServiceRequest).checkPolicy = checkPolicyForActor.bind(
				null,
				repos,
				actor.actor_id,
			);
			(req as AuthorizedServiceRequest).checkHubAccess = checkHubAccessForActor.bind(
				null,
				repos,
				actor.actor_id,
			);
		}
	} else {
		// NonAuthenticatedServiceRequest
		if (actor) throw Error('invalid service request');
	}
	return req;
}
