import type {WritableUi} from '$lib/ui/ui';
import type {ApiResult} from '$lib/server/api';
import type {Actions} from '$lib/vocab/action/actionTypes';

export interface Mutation {
	(ctx: MutationContext<any>): any;
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
}
