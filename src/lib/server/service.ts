import type {Logger} from '@grogarden/util/log.js';
import type {Result} from '@grogarden/util/result.js';

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

export type ServiceRequest<TParams = any> =
	| NonAuthenticatedServiceRequest<TParams>
	| NonAuthorizedServiceRequest<TParams>
	| AuthorizedServiceRequest<TParams>;
export interface BaseServiceRequest<TParams = any> {
	repos: Repos;
	params: TParams;
	account_id: AccountId | undefined;
	actor: ActionActor | undefined;
	session: ISessionApi;
	broadcast: IBroadcastApi;
	passwordHasher: PasswordHasher;
	afterResponse: AfterResponse;
	checkPolicy: CheckPolicy | undefined;
	checkHubAccess: CheckHubAccess | undefined;
}
export interface NonAuthenticatedServiceRequest<TParams = any> extends BaseServiceRequest<TParams> {
	account_id: undefined;
	actor: undefined;
	checkPolicy: undefined;
	checkHubAccess: undefined;
}
export interface NonAuthorizedServiceRequest<TParams = any> extends BaseServiceRequest<TParams> {
	account_id: AccountId;
	actor: undefined;
	checkPolicy: undefined;
	checkHubAccess: undefined;
}
export interface AuthorizedServiceRequest<TParams = any> extends BaseServiceRequest<TParams> {
	account_id: AccountId;
	actor: ActionActor;
	checkPolicy: CheckPolicy;
	checkHubAccess: CheckHubAccess;
}

export interface CheckPolicy {
	(name: PolicyName, hub_id: HubId): Promise<void>;
}

export interface CheckHubAccess {
	(hub_id: HubId): Promise<void>;
}

export interface ToServiceRequest<TParams = any> {
	(
		repos: Repos,
		params: TParams,
		account_id: undefined,
		actor: undefined,
		session: ISessionApi,
		broadcast: IBroadcastApi,
		passwordHasher: PasswordHasher,
		afterResponse: AfterResponse,
	): NonAuthenticatedServiceRequest<TParams>;
	(
		repos: Repos,
		params: TParams,
		account_id: AccountId,
		actor: undefined,
		session: ISessionApi,
		broadcast: IBroadcastApi,
		passwordHasher: PasswordHasher,
		afterResponse: AfterResponse,
	): NonAuthorizedServiceRequest<TParams>;
	(
		repos: Repos,
		params: TParams,
		account_id: AccountId,
		actor: ActionActor,
		session: ISessionApi,
		broadcast: IBroadcastApi,
		passwordHasher: PasswordHasher,
		afterResponse: AfterResponse,
	): AuthorizedServiceRequest<TParams>;
	(
		repos: Repos,
		params: TParams,
		account_id: AccountId | undefined,
		actor: ActionActor | undefined,
		session: ISessionApi,
		broadcast: IBroadcastApi,
		passwordHasher: PasswordHasher,
		afterResponse: AfterResponse,
	): ServiceRequest<TParams>;
}
export const toServiceRequest: ToServiceRequest = (
	repos,
	params,
	account_id,
	actor,
	session,
	broadcast,
	passwordHasher,
	afterResponse,
) => {
	const req: BaseServiceRequest = {
		repos,
		params,
		account_id,
		actor,
		session,
		broadcast,
		passwordHasher,
		afterResponse,
		checkPolicy: undefined,
		checkHubAccess: undefined,
	};
	if (actor) {
		// TODO consider a `CheckApi` like `SessionApi` to group these helpers, if we add a 3rd,
		// or consider merging `checkHubAccess` into `checkPolicy` if that makes sense
		req.checkPolicy = checkPolicyForActor.bind(null, repos, actor.actor_id);
		req.checkHubAccess = checkHubAccessForActor.bind(null, repos, actor.actor_id);
	}
	return req as any;
};

export interface AfterResponse {
	(cb: AfterResponseCallback): void;
}
export interface AfterResponseCallback {
	(): void | Promise<void>;
}

export const flushAfterResponseCallbacks = async (
	afterResponseCallbacks: AfterResponseCallback[],
): Promise<void> => {
	for (const cb of afterResponseCallbacks) {
		await cb(); // eslint-disable-line no-await-in-loop
	}
};
