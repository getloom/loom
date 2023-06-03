import type {Logger} from '@feltjs/util/log.js';

import type {ServiceActionData} from '$lib/vocab/action/action';
import type {ISessionApi} from '$lib/session/SessionApi';
import {Repos} from '$lib/db/Repos';
import type {ActionActor} from '$lib/vocab/actor/actor';
import {type ApiResult, toFailedApiResult} from '$lib/server/api';
import type {AccountId} from '$lib/vocab/account/account';
import type {Result} from '@feltjs/util';
import type {ErrorResponse} from '$lib/util/error';
import type {HubId} from '$lib/vocab/hub/hub';
import type {IBroadcastApi} from '$lib/server/Broadcast';

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
}
export interface NonAuthorizedServiceRequest<TParams = any>
	extends NonAuthenticatedServiceRequest<TParams> {
	account_id: AccountId;
}
export interface AuthorizedServiceRequest<TParams = any>
	extends NonAuthorizedServiceRequest<TParams> {
	actor: ActionActor;
}

export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: undefined,
	actor: undefined,
	session: ISessionApi,
	broadcast: IBroadcastApi,
): NonAuthenticatedServiceRequest<TParams>;
export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: AccountId,
	actor: undefined,
	session: ISessionApi,
	broadcast: IBroadcastApi,
): NonAuthorizedServiceRequest<TParams>;
export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: AccountId,
	actor: ActionActor,
	session: ISessionApi,
	broadcast: IBroadcastApi,
): AuthorizedServiceRequest<TParams>;
export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: AccountId | undefined,
	actor: ActionActor | undefined,
	session: ISessionApi,
	broadcast: IBroadcastApi,
): ServiceRequest {
	const req: NonAuthenticatedServiceRequest = {repos, params, session, broadcast};
	// TODO this is a bit hacky -- it may be preferred to have 3 different versions of `toServiceRequest` instead
	if (account_id) {
		(req as NonAuthorizedServiceRequest).account_id = account_id;
		if (actor) (req as AuthorizedServiceRequest).actor = actor;
	}
	return req;
}
