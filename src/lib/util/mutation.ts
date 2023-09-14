import type {WritableUi} from '$lib/ui/ui';
import type {ApiResult} from '$lib/server/api';
import type {Actions} from '$lib/vocab/action/actionTypes';

export interface Mutation<TParams = any, TResult extends ApiResult<unknown> | void = any> {
	(ctx: MutationContext<TParams, TResult>): any; // TODO improve return type
}

export interface MutationContext<
	TParams = unknown,
	TResult extends ApiResult<unknown> | void = any,
> {
	actionName: string;
	params: TParams;
	ui: WritableUi;
	actions: Actions;
	invoke: TResult extends void ? null : (params?: TParams) => Promise<TResult>;
	/**
	 * Wraps data changes to `ui` with a single synchronous transactional batch,
	 * flushing the callbacks added with `afterMutation` at the end.
	 */
	mutate: MutateUi;
	/**
	 * Adds a callback hook that runs after `mutate` finishes.
	 */
	afterMutation: AfterMutation;
}

export interface MutateUi {
	(cb: () => void): void;
}

export interface AfterMutation {
	(cb: AfterMutationCallback): void;
}

export interface AfterMutationCallback {
	(): void;
}

export const createMutationContext = <
	TContext extends MutationContext<TParams, TResult>,
	TParams = unknown,
	TResult extends ApiResult<unknown> | void = any,
>(
	actionName: TContext['actionName'],
	params: TContext['params'],
	ui: TContext['ui'],
	actions: TContext['actions'],
	invoke: TContext['invoke'],
): TContext => {
	const callbacks: AfterMutationCallback[] = [];

	const mutate: MutateUi = (cb) => {
		// TODO call into a store batch function so we get atomic updates (see `@preactjs/signals` as an example)
		cb();
		if (callbacks.length) {
			for (const cb of callbacks) {
				cb(); // don't await promises
			}
			callbacks.length = 0;
		}
	};

	// TODO maybe let cbs register a key so they can override each other
	// (e.g. so there's only ever a single browser navigation)
	const afterMutation: AfterMutation = (cb) => {
		callbacks.push(cb);
	};

	const ctx: MutationContext<any> = {
		actionName,
		params,
		ui,
		actions,
		invoke,
		mutate,
		afterMutation,
	};
	return ctx as TContext; // TODO types could probably be improved to avoid casting, the `ctx: MutationContext<any>` should make it typesafe
};
