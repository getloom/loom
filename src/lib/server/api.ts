import {Result_Error, type Result} from '@grogarden/util/result.js';

import type {ErrorResponse} from '$lib/util/error.js';

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message);
	}
}

export const assertApiError = (errorMessage: string | null): void => {
	if (errorMessage) throw new ApiError(400, errorMessage);
};

export type ApiResult<TValue = any> = Result<
	{status: number; value: TValue},
	{status: number} & ErrorResponse
>;

export interface FailedApiResult {
	ok: false;
	status: number;
	message: string;
}

/**
 * Converts an `Error` object that may or may not
 * be an `ApiError` or `Result_Error` to a failed `ApiResult`.
 * The purpose is to enable throwing errors that specify
 * a `status` and user-facing error `message`.
 * @param err - Any `Error`, may or may not be a `Result_Error`.
 * @returns An `ApiResult` with `ok: false`.
 */
export const toFailedApiResult = (err: any): FailedApiResult =>
	err instanceof ApiError
		? {ok: false, status: err.status, message: err.message}
		: err instanceof Result_Error
		? {ok: false, status: (err.result as any).status || 500, message: err.message}
		: {ok: false, status: 500, message: Result_Error.DEFAULT_MESSAGE};
