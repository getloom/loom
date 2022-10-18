import type {Result} from '@feltcoop/felt';

import type {ErrorResponse} from '$lib/util/error';

export interface BroadcastMessage {
	type: 'broadcast';
	method: string;
	result: WebsocketResult;
	params: any;
}

export interface StatusMessage {
	type: 'status';
	status: number;
	message: string;
}

export type WebsocketResult<T = any> = Result<
	{status: number; value: T},
	{status: number} & ErrorResponse
>;
