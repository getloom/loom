import type {ApiResult} from '$lib/server/api';

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
