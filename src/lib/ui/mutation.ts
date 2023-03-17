import type {WritableUi} from '$lib/ui/ui';
import type {ApiResult} from '$lib/server/api';
import type {Actions} from '$lib/app/eventTypes';

export interface Mutation {
	(ctx: MutationContext<any>): any;
}

// TODO probably belongs in `$lib/app` or add generic params
export interface MutationContext<
	TParams = unknown,
	TResult extends ApiResult<unknown> | void = any,
> {
	eventName: string;
	params: TParams;
	ui: WritableUi;
	actions: Actions;
	invoke: TResult extends void ? null : (params?: TParams) => Promise<TResult>;
}
