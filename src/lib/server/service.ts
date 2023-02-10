import {NOT_OK} from '@feltjs/util';

import type {ServiceEventInfo} from '$lib/vocab/event/event';
import type {ISessionApi} from '$lib/session/SessionApi';
import {Repos} from '$lib/db/Repos';
import type {Database} from '$lib/db/Database';
import type {ActorPersona} from '$lib/vocab/persona/persona';
import {type ApiResult, toFailedApiResult} from '$lib/server/api';

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
	event: ServiceEventInfo;
	perform: (serviceRequest: NonAuthenticatedServiceRequest<TParams, TResult>) => Promise<TResult>;
}
export interface NonAuthorizedService<
	TParams extends object | null = any,
	TResult extends ApiResult = ApiResult,
> {
	event: ServiceEventInfo;
	perform: (serviceRequest: NonAuthorizedServiceRequest<TParams, TResult>) => Promise<TResult>;
}
export interface AuthorizedService<
	TParams extends object | null = any,
	TResult extends ApiResult = ApiResult,
> {
	event: ServiceEventInfo;
	perform: (serviceRequest: AuthorizedServiceRequest<TParams, TResult>) => Promise<TResult>;
}

export type ServiceRequest =
	| NonAuthenticatedServiceRequest
	| NonAuthenticatedServiceRequest
	| AuthorizedServiceRequest;
export interface NonAuthenticatedServiceRequest<TParams = any, TResult = any> {
	repos: Repos;
	transact: (cb: (repos: Repos) => Promise<TResult>) => Promise<TResult>;
	params: TParams;
	session: ISessionApi;
}
export interface NonAuthorizedServiceRequest<TParams = any, TResult = any>
	extends NonAuthenticatedServiceRequest<TParams, TResult> {
	account_id: number;
}
export interface AuthorizedServiceRequest<TParams = any, TResult = any>
	extends NonAuthorizedServiceRequest<TParams, TResult> {
	actor: ActorPersona;
}

export function toServiceRequest<TParams = any, TResult extends ApiResult = ApiResult>(
	db: Database,
	params: TParams,
	account_id: undefined,
	actor: undefined,
	session: ISessionApi,
): NonAuthenticatedServiceRequest<TParams, TResult>;
export function toServiceRequest<TParams = any, TResult extends ApiResult = ApiResult>(
	db: Database,
	params: TParams,
	account_id: number,
	actor: undefined,
	session: ISessionApi,
): NonAuthorizedServiceRequest<TParams, TResult>;
export function toServiceRequest<TParams = any, TResult extends ApiResult = ApiResult>(
	db: Database,
	params: TParams,
	account_id: number,
	actor: ActorPersona,
	session: ISessionApi,
): AuthorizedServiceRequest<TParams, TResult>;
export function toServiceRequest<TParams = any, TResult extends ApiResult = ApiResult>(
	db: Database,
	params: TParams,
	account_id: number | undefined,
	actor: ActorPersona | undefined,
	session: ISessionApi,
): ServiceRequest {
	let called = false; // disallow multiple calls
	const req: NonAuthenticatedServiceRequest = {
		repos: db.repos,
		// TODO support savepoints -- https://github.com/porsager/postgres#transactions
		transact: async (cb) => {
			if (called) return NOT_OK;
			called = true;
			let result: TResult; // cache to pass through if the inner transaction promise rejects
			return db.sql
				.begin(async (sql) => {
					result = await cb(new Repos(sql));
					if (!result.ok) throw Error(); // cancel the transaction; the error is caught and swallowed ahead
					return result;
				})
				.catch((err) => {
					if (result === undefined) {
						result = toFailedApiResult(err) as TResult; // TODO how to avoid casting?
					}
					return result;
				});
		},
		params,
		session,
	};
	// TODO this is a bit hacky -- it may be preferred to have 3 different versions of `toServiceRequest` instead
	if (account_id) {
		(req as NonAuthorizedServiceRequest).account_id = account_id;
		if (actor) (req as AuthorizedServiceRequest).actor = actor;
	}
	return req;
}
