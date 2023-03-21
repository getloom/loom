import type {ApiResult} from '$lib/server/api';
import type {ServiceActionData} from '$lib/vocab/action/action';

export interface ApiClient<
	TParamsMap extends Record<string, any> = any, // TODO default and value types?
	TResultMap extends Record<string, any> = any, // TODO default and value types?
> {
	find: (name: string) => ServiceActionData | undefined; // TODO custom event types
	invoke: <TServiceName extends string, TParams extends TParamsMap[TServiceName]>(
		name: TServiceName,
		params: TParams,
	) => Promise<ApiResult<TResultMap[TServiceName]>>;
	close: () => void;
}
