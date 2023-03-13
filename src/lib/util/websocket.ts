import type {ApiResult} from '$lib/server/api';

// TODO maybe merge with `$lib/server/broadcast.ts`

export interface BroadcastMessage {
	type: 'broadcast';
	method: string;
	result: ApiResult;
	params: any;
}

export interface StatusMessage {
	type: 'status';
	status: number;
	message: string;
}
