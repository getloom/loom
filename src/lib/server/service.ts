import type {Result} from '@feltcoop/felt';

import type {ServiceEventInfo} from '$lib/vocab/event/event';
import type {ISessionApi} from '$lib/session/SessionApi';
import {Repos} from '$lib/db/Repos';
import type {Database} from '$lib/db/Database';

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
export interface Service<TParams extends object | null, TResult extends Result> {
	event: ServiceEventInfo;
	perform: (serviceRequest: ServiceRequest<TParams, TResult>) => Promise<TResult>;
}

export interface ServiceRequest<TParams, TResult> {
	repos: Repos;
	transact: (cb: (repos: Repos) => Promise<TResult>) => Promise<TResult>;
	params: TParams;
	account_id: number;
	session: ISessionApi;
}

export const toServiceRequest = <TParams = any, TResult extends Result = any>(
	db: Database,
	params: TParams,
	account_id: number,
	session: ISessionApi,
): ServiceRequest<TParams, TResult> => {
	let repos: Repos | undefined; // cache for service composition
	let result: TResult; // cache to pass through if the inner transaction promise rejects
	return {
		repos: db.repos,
		// TODO support creating new transactions outside of this singleton, which is needed for service composition
		// TODO support savepoints -- https://github.com/porsager/postgres#transactions
		transact: async (cb) =>
			repos
				? cb(repos)
				: db.sql
						.begin(async (sql) => {
							result = await cb((repos = new Repos(sql)));
							if (!result.ok) throw Error('Failed transction');
							return result as any;
						})
						.catch((err) => {
							if (result === undefined) {
								throw err; // rethrow errors that happen in `cb`
							} else {
								return result;
							}
						}),
		params,
		account_id, // TODO how to handle this type for services that don't require an account_id?
		session,
	};
};
