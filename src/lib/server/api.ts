import {ResultError, type Result} from '@feltjs/util';

import type {ErrorResponse} from '$lib/util/error';

export type ApiResult<TValue = any> = Result<
	{status: number; value: TValue},
	{status: number} & ErrorResponse
>;

/**
 * Converts an `Error` object that may or may not be a `ResultError` to a failed `ApiResult`.
 * @param err - Any `Error`, may or may not be a `ResultError`.
 * @returns An `ApiResult` with `ok: false`.
 */
export const toFailedApiResult = (err: any): {ok: false; status: number; message: string} =>
	err instanceof ResultError
		? {ok: false, status: (err.result as any).status || 500, message: err.message}
		: {ok: false, status: 500, message: ResultError.DEFAULT_MESSAGE};
