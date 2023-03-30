import type {Logger} from '@feltjs/util/log.js';

import type {ServiceActionData} from '$lib/vocab/action/action';
import type {ISessionApi} from '$lib/session/SessionApi';
import {Repos} from '$lib/db/Repos';
import type {ActionActor} from '$lib/vocab/actor/persona';
import {type ApiResult, toFailedApiResult} from '$lib/server/api';

export const performService = async (
	service: Service,
	serviceRequest: ServiceRequest,
	log?: Logger,
): Promise<ApiResult> => {
	let result!: ApiResult;
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
	TResult extends ApiResult = ApiResult,
> {
	action: ServiceActionData;
	transaction: boolean;
	perform: (serviceRequest: NonAuthenticatedServiceRequest<TParams>) => Promise<TResult>;
}
export interface NonAuthorizedService<
	TParams extends object | null = any,
	TResult extends ApiResult = ApiResult,
> {
	action: ServiceActionData;
	transaction: boolean;
	perform: (serviceRequest: NonAuthorizedServiceRequest<TParams>) => Promise<TResult>;
}
export interface AuthorizedService<
	TParams extends object | null = any,
	TResult extends ApiResult = ApiResult,
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
}
export interface NonAuthorizedServiceRequest<TParams = any>
	extends NonAuthenticatedServiceRequest<TParams> {
	account_id: number;
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
): NonAuthenticatedServiceRequest<TParams>;
export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: number,
	actor: undefined,
	session: ISessionApi,
): NonAuthorizedServiceRequest<TParams>;
export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: number,
	actor: ActionActor,
	session: ISessionApi,
): AuthorizedServiceRequest<TParams>;
export function toServiceRequest<TParams = any>(
	repos: Repos,
	params: TParams,
	account_id: number | undefined,
	actor: ActionActor | undefined,
	session: ISessionApi,
): ServiceRequest {
	const req: NonAuthenticatedServiceRequest = {repos, params, session};
	// TODO this is a bit hacky -- it may be preferred to have 3 different versions of `toServiceRequest` instead
	if (account_id) {
		(req as NonAuthorizedServiceRequest).account_id = account_id;
		if (actor) (req as AuthorizedServiceRequest).actor = actor;
	}
	return req;
}
